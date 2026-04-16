import { usernameClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

const authClient = createAuthClient({
  plugins: [usernameClient()],
})

export const { signOut } = authClient
