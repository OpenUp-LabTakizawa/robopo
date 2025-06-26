import { DrizzleAdapter } from "@auth/drizzle-adapter"
import type { User } from "next-auth"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { fetchUser } from "@/app/lib/auth/fetchUser"
import { db } from "@/app/lib/db/db"
import authConfig from "@/auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
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
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 days
  },
})
