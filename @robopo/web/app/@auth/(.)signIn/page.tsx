import { SignInModal } from "@/components/auth/signInModal"

// Intercepts client-side navigations to /signIn so the modal opens on top of
// the current page.
export default function InterceptedSignIn() {
  return <SignInModal />
}
