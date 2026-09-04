import "server-only";
import { sql } from "./client";
import { seedOpportunities, seedNotifications } from "./seed-data";

async function migrateApplicationsToPerUser() {
  // The applications table used to have no owner — every signed-in account
  // shared the same saved/applied state. Since applying to the same
  // opportunity now needs to happen per-user, opportunity_id can no longer
  // be the primary key alone. We're pre-launch, so it's safe to drop and
  // recreate rather than write a data-preserving migration for test rows.
  const existing = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'user_id'
  `;
  if (existing.length === 0) {
    await sql`DROP TABLE IF EXISTS applications`;
  }
}

async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      organization TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      deadline TEXT NOT NULL,
      days_left INTEGER NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL,
      image TEXT NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  // Admin-entered opportunities may not know the exam date or deadline yet —
  // these are real, optional dates (vs. the legacy text fields above, which
  // stay required for backward compatibility with the seeded data).
  // Optional structured sub-positions for a multi-role listing (e.g. one
  // organization posting 3 different jobs at once) — each with its own
  // title/location/description, shown as separate clickable profiles
  // instead of forcing everything into one description blob.
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS profiles JSONB`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS level TEXT`;
  // Real distinction for Job-type listings — CDI (permanent) vs CDD (fixed-term).
  // Kept separate from "type" since a CDI and a CDD are both still "Job".
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS contract_type TEXT`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS exam_date DATE`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS oral_exam_date DATE`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS deadline_date DATE`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS specialization TEXT`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS grade TEXT`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS positions_count INTEGER`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS website TEXT`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS keywords TEXT`;
  await sql`ALTER TABLE opportunities ALTER COLUMN deadline DROP NOT NULL`;
  await sql`ALTER TABLE opportunities ALTER COLUMN date DROP NOT NULL`;
  await sql`ALTER TABLE opportunities ALTER COLUMN days_left DROP NOT NULL`;
  await sql`ALTER TABLE opportunities ALTER COLUMN description SET DEFAULT ''`;
  await sql`ALTER TABLE opportunities ALTER COLUMN tags SET DEFAULT '[]'`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Profile info the user sets themselves — used to highlight opportunities
  // that match their level/specialization/location.
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS level TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT`;

  // Monetization: first 100 signups get 2 months of unlimited tracking free
  // as founding members (not lifetime — it expires like a real subscription
  // unless they pay to extend it). Everyone after gets a limited free tier,
  // with an optional paid plan (manually approved — no payment gateway yet).
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_active_until TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_requested_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_first_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_last_name TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT`;

  // Manager accounts: a Premium user can pay for a tier that lets them link
  // and act on behalf of other accounts (view-only for the linked person).
  // Reuses the request/payment fields above — manager_tier_requested is what
  // distinguishes "this pending request is for a manager tier" from a normal
  // individual Premium request using the same subscription_requested_at flow.
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id TEXT REFERENCES users(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_code TEXT UNIQUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_tier TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_tier_requested TEXT`;

  // A user can add their own concours for personal tracking — private by
  // default (is_public = false), visible only to them, until an admin
  // reviews and promotes it. Admin/seeded opportunities are public.
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT TRUE`;
  await sql`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS created_by_user_id TEXT REFERENCES users(id) ON DELETE CASCADE`;

  await migrateApplicationsToPerUser();

  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      saved BOOLEAN NOT NULL DEFAULT FALSE,
      stage TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, opportunity_id)
    )
  `;

  // Lets a user record their own oral/exam date once they know it, for
  // opportunities where the admin hasn't set an official one yet.
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_exam_date DATE`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_oral_exam_date DATE`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS receipt_url TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS receipt_filename TEXT`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS written_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS oral_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE`;
  await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS deadline_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE`;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      read BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  // Additive migration — NULL user_id means a global announcement (existing
  // seeded notifications), a real user_id means a personal reminder (e.g.
  // "you got accepted"). Safe to run every time; existing rows keep working.
  await sql`
    ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE
  `;
  await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT`;

  // Tracks meaningful admin actions — who did what, when. Read-only from the
  // UI side; nothing in the app ever deletes from this table.
  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id SERIAL PRIMARY KEY,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Lets a signed-in user report a technical problem directly to the admin —
  // captures who reported it and what page they were on, so it's actually
  // actionable instead of a vague "something's broken" message.
  await sql`
    CREATE TABLE IF NOT EXISTS problem_reports (
      id SERIAL PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      page_url TEXT,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 1,
      window_start TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  // Lightweight visit tracking — one row per page load. visitor_id is an
  // anonymous cookie so guests count too, not just logged-in users.
  await sql`
    CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      visitor_id TEXT NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      path TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at)`;

  await sql`
    CREATE TABLE IF NOT EXISTS organization_follows (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      organization_slug TEXT NOT NULL,
      organization_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, organization_slug)
    )
  `;

  // Admin-managed presentation for an organization — logo, description,
  // official site. Optional: an organization with no row here just falls
  // back to whatever's auto-derived from its opportunities.
  await sql`
    CREATE TABLE IF NOT EXISTS organization_profiles (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      description TEXT,
      website TEXT,
      keywords TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // CREATE TABLE IF NOT EXISTS above only applies to brand-new databases —
  // for one where this table already existed before "keywords" was added,
  // it's a no-op and never adds the column. This ALTER TABLE is what
  // actually backfills it onto an existing table. Safe to run every time.
  await sql`ALTER TABLE organization_profiles ADD COLUMN IF NOT EXISTS keywords TEXT`;
  await sql`ALTER TABLE organization_profiles ADD COLUMN IF NOT EXISTS type_label_override TEXT`;
}

async function seedIfEmpty() {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM opportunities`;
  const count = (rows[0] as { count: number }).count;
  if (count > 0) return;

  for (const o of seedOpportunities) {
    await sql`
      INSERT INTO opportunities
        (id, title, organization, location, type, status, deadline, days_left, date, description, tags, image, featured)
      VALUES
        (${o.id}, ${o.title}, ${o.organization}, ${o.location}, ${o.type}, ${o.status}, ${o.deadline},
         ${o.daysLeft}, ${o.date}, ${o.description}, ${JSON.stringify(o.tags)}, ${o.image}, ${Boolean(o.featured)})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  for (const n of seedNotifications) {
    await sql`INSERT INTO notifications (title, description) VALUES (${n.title}, ${n.description})`;
  }
}

// One-time cleanup for opportunities created before the deadline/date
// defaults were translated — any row still holding the old literal English
// text gets updated to the current French default. Safe to run on every
// init: the WHERE clause only ever matches genuinely stale rows, so once
// they're fixed this becomes a no-op.
async function fixStaleEnglishDefaults() {
  await sql`
    UPDATE opportunities
    SET deadline = 'Date limite non précisée'
    WHERE deadline = 'Date unknown'
  `;
  await sql`
    UPDATE opportunities
    SET date = 'Date limite non précisée'
    WHERE date = 'Date unknown'
  `;
}

// Cache the init promise at module scope so concurrent requests within the
// same serverless instance share one initialization instead of racing.
let initPromise: Promise<void> | null = null;

export function ensureDb(): Promise<void> {
  if (!initPromise) {
    initPromise = createTables().then(seedIfEmpty).then(fixStaleEnglishDefaults);
  }
  return initPromise;
}
