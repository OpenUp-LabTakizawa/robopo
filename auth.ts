import NextAuth, { type User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getUserByName } from "@/app/lib/db/queries/queries"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text", placeholder: "name" },
                password: { label: "Password", type: "password", placeholder: "*********" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({
                        username: z.string(),
                        password: z.string(),
                    })
                    .safeParse(credentials)
                if (parsedCredentials.success) {
                    const { username, password } = parsedCredentials.data
                    // ユーザー名とパスワードを検証
                    const user = await getUserByName(username)
                    if (!user){
                        console.error("User not found")
                        return null
                    }
                    const passwordMatch = await bcrypt.compare (password, user.password)
                    const authUser: User = {
                        id: user.id.toString(),
                        name: user.name,
                        email: null,
                        image: null,
                    }
                    if (passwordMatch) {
                        return authUser
                    }
                }
                console.error("Invalid credentials")
                // 認証に失敗した場合はnullを返す
                return null
            },
        }),
    ],
    callbacks: {
        jwt( { token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            session.user.id = token.id as string
            return session
        },
        authorized: async ({ auth }) => {
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
})
