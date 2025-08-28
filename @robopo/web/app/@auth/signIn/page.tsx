"use client"

import { useSearchParams } from "next/navigation"
import { useActionState, useEffect, useId } from "react"
import {
  ModalBackButton,
  ModalBackdrop,
} from "@/app/components/common/commonModal"
import { signInAction } from "@/app/components/server/auth"
import { SIGN_IN_CONST } from "@/app/lib/const"

export default function SignIn() {
  const params = useSearchParams()
  const rawCallbackUrl = params.get("callbackUrl") || "/"
  const usernameId = useId()
  const passwordId = useId()

  // callbackUrlのバリデーション
  // クロスサイトスクリプティング&フィッシング攻撃対策
  function getSafeCallbackUrl(cb: string) {
    try {
      const url = new URL(cb, window.location.origin)
      if (
        typeof window !== "undefined" &&
        url.origin === window.location.origin &&
        url.pathname.startsWith("/")
      ) {
        return url.pathname + url.search + url.hash
      }
    } catch {
      return "/"
    }
    return "/"
  }

  const callbackUrl = getSafeCallbackUrl(rawCallbackUrl)
  const [state, action] = useActionState(signInAction, undefined)

  useEffect(() => {
    if (state?.success) {
      window.location.replace(callbackUrl)
    }
  }, [state, callbackUrl])

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <form action={action} className="flex flex-col items-center">
          <label className="input" htmlFor={usernameId}>
            <span className="label">ユーザー名</span>
            <input
              id={usernameId}
              type="text"
              name="username"
              placeholder="robosava"
              required={true}
            />
          </label>
          <br />
          <label className="input" htmlFor={passwordId}>
            <span className="label">パスワード</span>
            <input
              id={passwordId}
              type="password"
              name="password"
              placeholder="12345678"
              required={true}
            />
          </label>
          <div className="flex">
            <button className="btn btn-accent my-3 flex" type="submit">
              {SIGN_IN_CONST.label}
              {SIGN_IN_CONST.icon}
            </button>
            <ModalBackButton />
          </div>
          <div className="m-3 flex text-red-500">{state?.message}</div>
        </form>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}
