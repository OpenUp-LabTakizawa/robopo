"use client"

import { CircleAlert, CircleCheck, LogIn } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useActionState, useEffect, useId, useState } from "react"
import { useFormStatus } from "react-dom"
import { signInAction } from "@/actions/auth"
import { ModalBackButton, ModalBackdrop } from "@/components/common/commonModal"
import { Skeleton } from "@/components/common/skeleton"

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
        <CircleCheck className="size-5" />
        ログイン成功
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
          <span className="loading loading-spinner loading-sm" />
          ログイン中
        </>
      ) : (
        <>
          <LogIn className="size-5" />
          ログイン
        </>
      )}
    </button>
  )
}

function FormFields({
  usernameId,
  passwordId,
  onUsernameChange,
  onPasswordChange,
}: {
  usernameId: string
  passwordId: string
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
        <input
          id={passwordId}
          type="password"
          name="password"
          placeholder="12345678"
          required
          onChange={(e) => onPasswordChange(e.target.value)}
          className="input w-full rounded-xl border-base-300/50 bg-base-200/50 transition-all duration-200 focus:border-primary/50 focus:bg-base-100 focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </fieldset>
  )
}

function SignInForm() {
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
          </div>

          <FormFields
            usernameId={usernameId}
            passwordId={passwordId}
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
              <CircleAlert className="size-5 shrink-0" />
              {state.message}
            </div>
          )}
        </form>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}

function SignInSkeleton() {
  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-sm">
        <div className="flex animate-[skeletonFadeIn_0.3s_ease-out] flex-col items-center px-2">
          {/* Title */}
          <div className="mb-6 w-full text-center">
            <Skeleton className="mx-auto h-7 w-24" />
          </div>

          {/* Form fields */}
          <div className="flex w-full flex-col gap-4">
            <div>
              <Skeleton className="mb-1.5 h-3.5 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-3.5 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex w-full flex-col gap-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="modal-backdrop" />
    </dialog>
  )
}

// useSearchParams() needs a Suspense boundary to keep the rest of the route
// prerenderable.
export function SignInModal() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInForm />
    </Suspense>
  )
}
