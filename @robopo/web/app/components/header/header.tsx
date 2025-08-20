"use client"
import Image from "next/image"
import Link from "next/link"
import type { Session } from "next-auth"
import { SessionProvider, signOut } from "next-auth/react"
import { DropdownMenu } from "@/app/components/parts/dropdownMenu"
import { SIGN_IN_CONST, SIGN_OUT_CONST } from "@/app/lib/const"

type Props = {
  session: Session | null
}

export const Header = ({ session }: Props) => {
  return (
    <>
      <header className="flex flex-row h-24 md:h-14 items-center relative">
        <div className="w-full flex items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              className="dark:invert"
              width={50}
              height={50}
              style={{
                maxWidth: "100%",
                height: "100%",
              }}
            />
          </Link>
          <div className="hidden ml-3 lg:inline-block">
            {session?.user ? (
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                type="button"
                className="btn btn-primary p-2 text-xl"
              >
                {SIGN_OUT_CONST.icon}
                {SIGN_OUT_CONST.label}
              </button>
            ) : (
              <Link
                href={SIGN_IN_CONST.href}
                className="btn btn-primary p-2 min-w-0 text-xl"
              >
                {SIGN_IN_CONST.icon}
                {SIGN_IN_CONST.label}
              </Link>
            )}
          </div>
        </div>
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-center text-xl md:text-3xl font-semibold whitespace-nowrap">
          ロボサバ大会集計アプリ
          <br className="md:hidden" />
          ROBOPO
        </h1>
        <div className="w-full flex justify-end">
          <SessionProvider session={session}>
            <DropdownMenu />
          </SessionProvider>
        </div>
      </header>
    </>
  )
}

export default Header
