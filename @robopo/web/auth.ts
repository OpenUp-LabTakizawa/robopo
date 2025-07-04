import { DrizzleAdapter } from "@auth/drizzle-adapter"
import bcrypt from "bcrypt"
import type { User } from "next-auth"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { db } from "@/app/lib/db/db"
import { getUserByName } from "@/app/lib/db/queries/queries"
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
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string().nonempty(),
            password: z.string().nonempty(),
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data
          const user = await getUserByName(username)

          const passwordMatch = await bcrypt.compare(password, user.password)
          if (passwordMatch) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: null,
              image: null,
            } as User
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 days
  },
})
