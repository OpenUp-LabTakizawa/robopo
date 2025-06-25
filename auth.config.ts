import type { NextAuthConfig, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { fetchUser } from "@/app/lib/auth/fetchUser"

export default {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text", placeholder: "name" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "*********",
        },
      },
      authorize: async (credentials) => {
        try {
          const user = await fetchUser(credentials)
          if (!user) {
            return null
          }
          return user as User
        } catch {
          return null
        }
      },
    }),
  ],
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
} satisfies NextAuthConfig
