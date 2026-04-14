"use client"

import {
  ArrowRightEndOnRectangleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline"
import { useSearchParams } from "next/navigation"
import { useActionState, useEffect, useId, useState } from "react"
import { useFormStatus } from "react-dom"
import {
  ModalBackButton,
  ModalBackdrop,
} from "@/app/components/common/commonModal"
import { signInAction } from "@/app/components/server/auth"

function SubmitButton({
  success,
  disabled,
}: {
  success?: boolean
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  if (success) {
    return (
      <button
        type="button"
        disabled
        className="btn btn-success w-full rounded-xl text-success-content shadow-lg shadow-success/25"
      >
        ログイン成功
        <CheckCircleIcon className="size-5" />
      </button>
    )
  }

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-primary/30 hover:shadow-xl"
    >
      {pending ? (
        <>
          ログイン中
          <span className="loading loading-spinner loading-sm" />
        </>
      ) : (
        <>
          ログイン
          <ArrowRightEndOnRectangleIcon className="size-5" />
        </>
      )}
    </button>
  )
}

function FormFields({
  usernameId,
  passwordId,
  showPassword,
  setShowPassword,
  onUsernameChange,
  onPasswordChange,
}: {
  usernameId: string
  passwordId: string
  showPassword: boolean
  setShowPassword: (fn: (prev: boolean) => boolean) => void
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
}) {
  const { pending } = useFormStatus()

  return (
    <fieldset disabled={pending} className="flex w-full flex-col gap-4">
      <div>
        <label
          htmlFor={usernameId}
          className="mb-1.5 block font-medium text-base-content/70 text-sm"
        >
          ユーザー名
        </label>
        <input
          id={usernameId}
          type="text"
          name="username"
          placeholder="robosava"
          required
          onChange={(e) => onUsernameChange(e.target.value)}
          className="input w-full rounded-xl border-base-300/50 bg-base-200/50 transition-all duration-200 focus:border-primary/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label
          htmlFor={passwordId}
          className="mb-1.5 block font-medium text-base-content/70 text-sm"
        >
          パスワード
        </label>
        <div className="relative">
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="12345678"
            required
            onChange={(e) => onPasswordChange(e.target.value)}
            className="input w-full rounded-xl border-base-300/50 bg-base-200/50 pr-12 transition-all duration-200 focus:border-primary/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 flex items-center rounded-lg p-1.5 text-base-content/40 transition-colors hover:bg-base-300/50 hover:text-base-content/70"
            aria-label="パスワードを表示"
          >
            {showPassword ? (
              <EyeSlashIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </fieldset>
  )
}

export default function SignIn() {
  const params = useSearchParams()
  const rawCallbackUrl = params.get("callbackUrl") || "/"
  const usernameId = useId()
  const passwordId = useId()

  // Callback URL validation
  // XSS & phishing attack prevention
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
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        window.location.replace(callbackUrl)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [state, callbackUrl])

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-sm">
        <form action={action} className="flex flex-col items-center px-2">
          <div className="mb-6 w-full text-center">
            <h2 className="font-bold text-2xl text-base-content">ログイン</h2>
            <p className="mt-1 text-base-content/50 text-sm">
              アカウントにログインしてください
            </p>
          </div>

          <FormFields
            usernameId={usernameId}
            passwordId={passwordId}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
          />

          <div className="mt-6 flex w-full flex-col gap-2">
            <SubmitButton
              success={state?.success}
              disabled={!username.trim() || !password.trim()}
            />
            <ModalBackButton />
          </div>

          {state?.message && !state?.success && (
            <div className="mt-4 flex w-full items-center gap-2 rounded-lg bg-error/10 px-4 py-2.5 text-error text-sm">
              <ExclamationCircleIcon className="size-5 shrink-0" />
              {state.message}
            </div>
          )}
        </form>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}
