import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins"
import { db } from "@/app/lib/db/db"
import * as schema from "@/app/lib/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username(), nextCookies()],
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
  },
})
