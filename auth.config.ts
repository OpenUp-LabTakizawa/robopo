import type { NextAuthConfig, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { fetchUser, parsedCredentials } from "@/app/lib/auth"

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
          console.log("[authorize]start")
          const { username, password } = parsedCredentials(credentials)
          console.log(
            "[authorize] credentials",
            username,
            password ? "••••" : password,
          )
          const user = await fetchUser(username, password)
          console.log("[authorize] fetched user", user)
          console.log("[authorize]BASE_URL", process.env.DATABASE_URL)
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
