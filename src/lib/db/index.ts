import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prepared statements for Supabase transaction pooler (pgbouncer / supavisor).
// Keep max: 1 and idle_timeout: 20 in serverless environments to prevent connection slot exhaustion.
const client = postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
