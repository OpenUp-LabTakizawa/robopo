import type { Metadata } from "next"
import { SignInModal } from "@/components/auth/signInModal"

// Client-side navigations resolve metadata from this page, so it must match
// app/signIn/page.tsx.
export const metadata: Metadata = {
  title: "ログイン",
}

// Intercepts client-side navigations to /signIn so the modal opens on top of
// the current page.
export default function InterceptedSignIn() {
  return <SignInModal />
}
