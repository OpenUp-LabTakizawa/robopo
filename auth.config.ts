import type { NextAuthConfig } from "next-auth"

export default {
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
  pages: {
    signIn: "/signIn",
  },
  providers: [],
} satisfies NextAuthConfig
