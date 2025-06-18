import { fetchUser, parsedCredentials } from "@/app/lib/auth"
import type { NextAuthConfig, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"

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
        try {
          const { username, password } = parsedCredentials(credentials)
          const user = await fetchUser(username, password)
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
} satisfies NextAuthConfig
