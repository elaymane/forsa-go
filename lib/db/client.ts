import "server-only";
import { neon } from "@neondatabase/serverless";

// Uses Neon's serverless Postgres driver — queries go over HTTP, which is
// what makes this safe to use from Vercel's serverless functions (a normal
// TCP connection pool like node-postgres doesn't survive across invocations
// the way serverless platforms recycle instances).
//
// Set DATABASE_URL in .env.local for local dev, and in your hosting
// provider's environment variables in production. Get a free connection
// string at https://neon.tech.

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL. Create a free Postgres database at https://neon.tech, " +
      "then add its connection string to .env.local (see .env.example)."
  );
}

export const sql = neon(process.env.DATABASE_URL);
