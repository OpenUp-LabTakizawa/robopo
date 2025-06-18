import { db } from "@/app/lib/db/db"
import authConfig from "@/auth.config"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import NextAuth from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
    authorized({ auth }) {
      return !!auth?.user
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 days
  },
  pages: {
    signIn: "/signIn",
  },
  ...authConfig,
})
