# Forsa Go

A landing page, real accounts, and a dashboard for tracking Moroccan
opportunities — concours, jobs, internships, trainings and scholarships —
backed by a hosted Postgres database.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components + Server Actions)
- React 19 + TypeScript
- **Postgres via [Neon](https://neon.tech)** — free serverless Postgres, queried over HTTP via `@neondatabase/serverless` (this is what makes it safe to run from Vercel's serverless functions — no persistent TCP connection pool to manage)
- Tailwind CSS 3
- [Framer Motion](https://www.framer.com/motion/) for micro-interactions
- [lucide-react](https://lucide.dev) for icons

## Getting started (local dev)

1. Create a free database at [neon.tech](https://neon.tech) — takes about a minute, no credit card.
2. Copy `.env.example` to `.env.local` and paste in your Neon connection string:
   ```bash
   cp .env.example .env.local
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). Tables are created and
seeded automatically the first time the app queries the database — nothing
to run manually.

## Deploying (free)

1. Push this repo to GitHub.
2. Create a free database at [neon.tech](https://neon.tech) if you haven't already, and copy its connection string.
3. Import the repo into [Vercel](https://vercel.com) (free Hobby plan).
4. In the Vercel project's **Settings → Environment Variables**, add `DATABASE_URL` with your Neon connection string.
5. Deploy. Every push to your main branch redeploys automatically.

Vercel's Hobby plan is free for personal/non-commercial projects. If you
start charging users, their terms require upgrading to Pro.

## Routes

| Route            | Access    | What it is                                   |
| ----------------- | --------- | --------------------------------------------- |
| `/`               | Public    | Marketing/landing page explaining the product |
| `/login`          | Public    | Log in                                        |
| `/signup`         | Public    | Create an account                             |
| `/dashboard`      | Signed in | Main dashboard                                |
| `/opportunities`  | Signed in | Browsable, filterable opportunity grid        |

`middleware.ts` redirects signed-out visitors away from `/dashboard` and
`/opportunities` to `/login`. Each of those pages also re-checks the session
server-side (via `lib/session.ts`) before rendering, since middleware only
checks for the cookie's *presence*, not validity — the page-level check is
what actually looks the session up in the database.

## Auth model

Deliberately simple and dependency-free:

- Passwords are hashed with Node's built-in `crypto.scryptSync` (no bcrypt/argon2 package to install).
- A session is a random token stored in a `sessions` table, set as an
  `httpOnly` cookie (`forsa_session`). No JWT, no third-party auth provider.

## How data flows

- **Reads**: `app/dashboard/page.tsx` and `app/opportunities/page.tsx` are
  `async` Server Components. They call functions in `lib/db/*.ts` directly
  (no API routes needed), fetching in parallel with `Promise.all`, and pass
  plain data down as props.
- **Writes**: `app/actions.ts` exports Server Actions (`"use server"`).
  Client components import and call these directly from `onClick` handlers
  (wrapped in `useTransition`) or as `<form action={...}>` targets (auth
  forms, via `useActionState`). Each data-mutating action calls
  `revalidatePath` so both pages immediately reflect the change.

## What's actually wired up

- **Sign up / Log in / Log out** — real accounts, hashed passwords, real sessions
- **Save** (bookmark icon, all three views) — toggles a persisted `saved` flag
- **Apply** — moves an application to the `applied` stage
- **Track / "Mark Written/Oral Exam" / "Mark Accepted"** — advances the same
  application through `applied → written → oral → accepted`
- **Withdraw application** — sets the stage to `rejected`
- **Notifications → Mark all** — marks all notifications as read in the DB
- **Filter / Sort** (Opportunities page) — filters and sorts the real dataset
- **Stats cards, pipeline tracker, dashboard hero counters** — all computed
  live from the database

## What's intentionally still a placeholder

- **Per-user data** — `applications` and `notifications` aren't scoped to a
  `user_id` yet, so right now every signed-in account shares the same saved/
  applied state. Real multi-user isolation is the natural next step (add a
  `user_id` column, filter every query by the current session's user).
- **Ask Assistant**, **Go Premium / Upgrade** (sidebar) — no chat/billing feature exists
- **Open Full Calendar** (dashboard timeline) — no calendar view exists
- **Details** (New Opportunities carousel), **Profile** (user menu) — no detail/profile pages exist yet

## Project structure

```
app/
  actions.ts          Server Actions: data mutations + auth (signup/login/logout)
  page.tsx             Public marketing/landing page
  login/, signup/      Public auth pages
  dashboard/, opportunities/   Signed-in app pages (Server Components)
middleware.ts          Edge-level redirect for signed-out visitors
components/
  marketing/            Landing page sections
  auth/                  Login/signup form + shared shell
  layout/                Sidebar, Topbar, AppShell (page shell)
  dashboard/             Hero, stats, pipeline, timeline, carousels
  opportunities/         Opportunity card + grid/pagination
  ui/                    Small shared primitives (Badge, Button)
lib/
  db/                     Neon Postgres client, schema/seed, auth, and data-access functions
  session.ts              Reads the session cookie → current user (server-only)
  filters/FilterContext.tsx  Shares filter/sort state between Topbar and page content
  theme/ThemeProvider.tsx    Single source of truth for dark/light mode
  navigation.ts              Sidebar nav items
types/
  opportunity.ts        Shared TypeScript types
```
