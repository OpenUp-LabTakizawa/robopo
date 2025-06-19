import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth from "next-auth"
import { db } from "@/app/lib/db/db"
import authConfig from "@/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 days
  },
  pages: {
    signIn: "/signIn",
  },
  ...authConfig,
})
