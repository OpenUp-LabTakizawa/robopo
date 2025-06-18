import { BASE_URL } from "@/app/lib/const"
import bcrypt from "bcryptjs"
import type { NextAuthConfig, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

// biome-ignore lint/style/noDefaultExport: Auth.js公式のdocumentに従う。というか、defaultを削除するとコードが通らない。https://authjs.dev/guides/edge-compatibility
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
        const parsedCredentials = z
          .object({
            username: z.string(),
            password: z.string(),
          })
          .safeParse(credentials)
        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data
          // ユーザー名とパスワードを検証
          const url = `${BASE_URL}/api/user/`
          try {
            const response = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: username }),
            })
            const { user } = await response.json()
            if (!user) {
              return null
            }
            const passwordMatch = await bcrypt.compare(password, user.password)
            const authUser: User = {
              id: user.id.toString(),
              name: user.name,
              email: null,
              image: null,
            }
            if (passwordMatch) {
              return authUser
            }
            // 認証に失敗した場合はnullを返す
            return null
          } catch (error) {
            // biome-ignore lint/suspicious/noConsole: errorを何か使わないと怒られるから使っておく。どちらにせよconsoleを使うなと怒られる。
            console.error("Error during authentication:", error)
            return null
          }
        }
        return null
      },
    }),
  ],
} satisfies NextAuthConfig
