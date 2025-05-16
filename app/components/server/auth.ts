"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

// signInのformState
type FormState =
  | {
    errors?: {
      username?: string[]
      password?: string[]
    }
    message?: string
  }
  | undefined

// サーバアクションのサインイン
export async function signInAction(state: FormState, formData: FormData) {
  "use server"

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
    // redirectがうまく走らない為、サインイン後にclient側でリダイレクトする
    await signIn("credentials", { redirect: false, username, password })
    return {
      success: true,
      message: "サインインに成功しました",
    }
  } catch (error) {
    // Redirectエラーは無視する
    // これはNextAuthの仕様で、サインイン後にリダイレクトするために発生するエラー
    console.log("error: ", error)
    if (error instanceof Error && error.message === "NEXT_REDIRECT") { throw error }
    // それ以外のエラーはサインイン失敗とする
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "サインインに失敗しました",
      }
    }
  }
}