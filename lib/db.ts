import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const db =
  global.pgPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 3,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = db;
}

export default db;