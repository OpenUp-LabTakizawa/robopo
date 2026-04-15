"use server"

import { auth } from "@/lib/auth/auth"

// Form state for signIn
type FormState =
  | {
      message?: string
      success?: boolean
    }
  | undefined

// Server action for sign-in
export async function signInAction(_state: FormState, formData: FormData) {
  const username = formData.get("username")?.toString().trim() ?? ""
  const password = formData.get("password")?.toString() ?? ""

  if (!username || !password) {
    return {
      success: false,
      message: "ログインに失敗しました",
    }
  }

  try {
    await auth.api.signInUsername({
      body: { username, password },
    })
    return {
      success: true,
      message: "ログインに成功しました",
    }
  } catch (error) {
    console.error("signInAction error:", error)
    return {
      success: false,
      message: "ログインに失敗しました",
    }
  }
}
