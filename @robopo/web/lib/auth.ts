import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { username } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/app/lib/db/db"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username(),
    nextCookies(),
  ],
  session: {
    expiresIn: 60 * 60 * 24, // 1 day
  },
})
