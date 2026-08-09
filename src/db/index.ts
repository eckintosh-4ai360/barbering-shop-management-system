import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_h78OlnyfVoks@ep-mute-sound-ay6a0g6h-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl:
      databaseUrl.includes("sslmode=") || databaseUrl.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
