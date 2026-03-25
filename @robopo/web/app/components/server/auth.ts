"use server"

import { auth } from "@/lib/auth"

// signInのformState
type FormState =
  | {
      errors?: {
        username?: string[]
        password?: string[]
      }
      message?: string
      success?: boolean
    }
  | undefined

// サーバアクションのサインイン
export async function signInAction(_state: FormState, formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")

  // バリデーション
  if (!username || typeof username !== "string") {
    return {
      success: false,
      message: "ユーザーネームが未入力です",
    }
  }
  if (!password || typeof password !== "string") {
    return {
      success: false,
      message: "パスワードが未入力です",
    }
  }

  try {
    await auth.api.signInUsername({
      body: { username, password },
    })
    return {
      success: true,
      message: "サインインに成功しました",
    }
  } catch {
    return {
      success: false,
      message: "サインインに失敗しました",
    }
  }
}
