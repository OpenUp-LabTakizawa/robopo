"use client"

import Image from "next/image"
import Link from "next/link"
import { SIGN_IN_CONST, SIGN_OUT_CONST } from "@/app/lib/const"
import { signOut } from "@/lib/auth-client"

type Props = {
  session: { user: { id: string; name: string } } | null
}

export function Header({ session }: Props) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-base-300 border-b bg-base-100/95 px-4 backdrop-blur-sm sm:px-0">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="ROBOPO Logo"
          width={36}
          height={36}
          style={{ maxWidth: "100%", height: "auto" }}
        />
        <span className="font-bold text-lg text-primary">ROBOPO</span>
      </Link>

      <div className="flex items-center gap-3">
        {session?.user && (
          <span className="hidden text-base-content/60 text-sm sm:inline">
            {session.user.name}
          </span>
        )}
        {session?.user ? (
          <button
            onClick={() =>
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/"
                  },
                },
              })
            }
            type="button"
            className="btn btn-ghost btn-sm rounded-full"
          >
            {SIGN_OUT_CONST.icon}
            <span className="hidden sm:inline">{SIGN_OUT_CONST.label}</span>
          </button>
        ) : (
          <Link
            href={SIGN_IN_CONST.href}
            className="btn btn-ghost btn-sm rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-primary-content"
            aria-label={SIGN_IN_CONST.label}
          >
            {SIGN_IN_CONST.icon}
            <span className="hidden sm:inline">{SIGN_IN_CONST.label}</span>
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
