import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

if (process.env.DATABASE_URL === undefined) {
  throw new Error("DATABASE_URL is not defined")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export const db = drizzle({
  client: pool,
})
