import type { Metadata } from "next"
import { SignInModal } from "@/components/auth/signInModal"

export const metadata: Metadata = {
  title: "ログイン",
}

// Rendered on a hard load of /signIn (e.g. the proxy redirect). Client-side
// navigations are intercepted by @auth/(.)signIn instead.
export default function SignInPage() {
  return <SignInModal />
}
