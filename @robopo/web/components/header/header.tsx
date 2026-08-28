"use client"

import { Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { NavigationDrawer } from "@/components/header/navigationDrawer"
import { signOut } from "@/lib/auth/auth-client"
import { SIGN_IN_CONST, SIGN_OUT_CONST } from "@/lib/navigation"

type Props = {
  session: {
    user: { id: string; name: string }
    isJudge: boolean
  } | null
}

// Session-dependent half of the header only. The <header> landmark and the
// brand live in the root layout, so exactly one of each is in the DOM even
// while this Suspense boundary is still streaming in.
export function Header({ session }: Props) {
  const [signingOut, setSigningOut] = useState(false)

  return (
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
      ) : null}
      {session?.user && !session.isJudge ? (
        <NavigationDrawer />
      ) : !session?.user ? (
        <>
          <Link
            href="/spectator"
            className="btn btn-sm rounded-full border-0 bg-gradient-to-r from-amber-400 to-orange-400 font-bold text-white shadow-amber-200/40 shadow-md transition-all duration-200 hover:from-amber-500 hover:to-orange-500 hover:shadow-amber-300/40 hover:shadow-lg"
            aria-label="観戦"
          >
            <Eye className="size-4" />
            LIVE観戦
          </Link>
          <Link
            href={SIGN_IN_CONST.href}
            className="btn btn-ghost btn-sm rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-primary-content"
            aria-label={SIGN_IN_CONST.label}
          >
            {SIGN_IN_CONST.icon}
            {SIGN_IN_CONST.label}
          </Link>
        </>
      ) : null}
    </div>
  )
}

export default Header
