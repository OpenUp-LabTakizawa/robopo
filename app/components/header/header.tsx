"use client"
import Link from "next/link"
import Image from "next/image"
import { SessionProvider, signOut } from "next-auth/react"
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
          {session?.user ? <button onClick={() => signOut({ redirect: true, callbackUrl: "/" })} className="btn btn-primary p-2 text-xl">Sign out</button> : <Link href="/signIn" className="btn btn-primary p-2 text-xl">Sign in</Link>}
          <Link href="/" className="btn btn-primary p-2 text-xl ml-5">
            Home
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header