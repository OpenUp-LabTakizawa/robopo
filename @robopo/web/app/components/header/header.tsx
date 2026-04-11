"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useNavigationGuard } from "@/app/hooks/useNavigationGuard"
import { SIGN_IN_CONST, SIGN_OUT_CONST } from "@/app/lib/const"
import { signOut } from "@/lib/auth-client"

type Props = {
  session: { user: { id: string; name: string } } | null
}

export function Header({ session }: Props) {
  const [signingOut, setSigningOut] = useState(false)
  const { isDirty } = useNavigationGuard()

  const logoContent = (
    <>
      <Image
        src="/logo.png"
        alt="ROBOPO Logo"
        width={36}
        height={36}
        style={{ maxWidth: "100%", height: "auto" }}
      />
      <span className="font-bold text-lg text-primary">ROBOPO</span>
    </>
  )

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-base-300 border-b bg-base-100/95 px-4 backdrop-blur-sm sm:px-0">
      {isDirty ? (
        <a href="/" className="flex items-center gap-2">
          {logoContent}
        </a>
      ) : (
        <Link href="/" className="flex items-center gap-2">
          {logoContent}
        </Link>
      )}

      <div className="flex items-center gap-3">
        {session?.user && (
          <span className="hidden text-base-content/60 text-sm sm:inline">
            {session.user.name}
          </span>
        )}
        {session?.user ? (
          <button
            onClick={() => {
              setSigningOut(true)
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/"
                  },
                  onError: () => {
                    setSigningOut(false)
                  },
                },
              })
            }}
            type="button"
            disabled={signingOut}
            className="btn btn-ghost btn-sm rounded-full"
          >
            {signingOut ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                切り替え中
              </>
            ) : (
              <>
                {SIGN_OUT_CONST.icon}
                {SIGN_OUT_CONST.label}
              </>
            )}
          </button>
        ) : (
          <Link
            href={SIGN_IN_CONST.href}
            className="btn btn-ghost btn-sm rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-primary-content"
            aria-label={SIGN_IN_CONST.label}
          >
            {SIGN_IN_CONST.icon}
            {SIGN_IN_CONST.label}
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
