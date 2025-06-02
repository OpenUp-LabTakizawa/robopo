"use client"
import Link from "next/link"
import Image from "next/image"
import { SessionProvider, signOut } from "next-auth/react"
import { HOME_CONST, SIGN_IN_CONST, SIGN_OUT_CONST } from "@/app/lib/const"
import DropdownMenu from "@/app/components/parts/dropdownMenu"

type Props = {
  session: any
}

export const Header = ({ session }: Props) => {
  return (
    <>
      <header className="flex flex-row h-24 md:h-14 items-center relative">
        {/* Logo & DropdownMenu */}
        <div className="flex items-center w-auto">
          {/* Logo */}
          <div>
            <Link href="/" className="mr-auto">
              <Image
                src="/logo.png"
                alt="Logo"
                className="dark:invert"
                width={50}
                height={50}
                style={{
                  maxWidth: "100%",
                  height: "auto"
                }} />
            </Link>
          </div>
          {/* メニューボタン (スマホ表示) */}
          <SessionProvider session={session}>
            <DropdownMenu />
          </SessionProvider>
        </div>
        {/* タイトル */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-center text-xl md:text-3xl font-semibold whitespace-nowrap">
          ロボサバ大会集計アプリ
          <br className="md:hidden" />
          ROBOPO
        </h1>
        {/* サインインorサインアウトボタン & HOMEボタン (PC表示) */}
        <div className="hidden lg:inline-block ml-auto">
          {session?.user ?
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
              type="button" className="btn btn-primary p-2 text-xl">
              {SIGN_OUT_CONST.icon}
              {SIGN_OUT_CONST.label}
            </button>
            :
            <Link href={SIGN_IN_CONST.href} className="btn btn-primary p-2 text-xl">
              {SIGN_IN_CONST.icon}
              {SIGN_IN_CONST.label}
            </Link>
          }
          <Link href={HOME_CONST.href} className="btn btn-primary p-2 text-xl ml-5">
            {HOME_CONST.icon}
            {HOME_CONST.label}
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header