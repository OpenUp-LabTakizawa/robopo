"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

const DropdownMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  return (
    <nav className="dropdown dropdown-end lg:hidden fixed right-[5%] z-50 space-y-2">
      <button
        className="navbar-burger flex items-center p-3 flex-row-reverse flex-grow"
        onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <svg className="block h-6 w-6 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <title>Mobile menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
      </button>
      <div
        className={`${isMenuOpen ? "flex" : "hidden"
          } absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:items-center lg:w-auto lg:space-x-6`}></div>
      {isMenuOpen && (
        <div className="navbar-menu relative z-50">
          <div
            className="navbar-backdrop fixed inset-0 bg-neutral-800 opacity-75"
            onClick={() => setIsMenuOpen(false)}></div>
          <div className="fixed top-0 left-0 bottom-0 flex flex-col w-4/6 max-w-sm py-6 px-6 bg-neutral-500/90 overflow-y-auto">
            {/* Logo & Close button */}
            <div className="flex items-center mb-8">
              <Link href="/">
                <div className="mr-auto text-3xl font-bold leading-none">
                  <div className="textShadow_wt text-white text-[2.2rem] font-bold text-nowrap max-[1000px]:text-[1.4rem] ">
                    メニュー
                  </div>
                </div>
              </Link>
              <button className="navbar-close ml-14" onClick={() => setIsMenuOpen(false)}>
                <svg
                  className="h-6 w-6 text-neutral-950 cursor-pointer hover:text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div>
              <NavLinks setIsMenuOpen={setIsMenuOpen} />
              {/* サインイン直後、更新されないらしく、ここだけサインアウトにならない。手動で強制的に更新するとサインアウトになるが。 */}
              {status === "authenticated" ? (
                <button
                  //? Close hamburger menu
                  onClick={() => {
                    setIsMenuOpen && setIsMenuOpen(false)
                    signOut({ redirect: true, redirectTo: "/" })
                  }}
                  className="flex mt-10 w-[fit-content] hover:bg-slate-500 hover:text-zinc/60 text-white px-3 py-1 rounded-md text-sm font-medium cursor-pointer text-[1.1rem]"
                >
                  サインアウト
                </button>
              ) : (
                <Link
                  onClick={() => { setIsMenuOpen && setIsMenuOpen(false) }}
                  href="/signIn"
                  className="flex mt-10 w-[fit-content] hover:bg-slate-500 hover:text-zinc/60 text-white px-3 py-1 rounded-md text-sm font-medium cursor-pointer text-[1.1rem]"
                >
                  サインイン
                </Link>)}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

type PropsType = {
  propClass?: string
  setIsMenuOpen?: (arg0: boolean) => void
}

const NavLinks = ({ propClass, setIsMenuOpen }: PropsType) => {
  const currentPath = usePathname()

  const links = [
    { label: "HOME", href: "/" },
    { label: "コース作成", href: "/course" },
    { label: "選手登録", href: "/player" },
    { label: "採点者登録", href: "/umpire" },
    { label: "大会設定", href: "/config" },
  ]

  return (
    <div
      className={`flex gap-3 mx-3 flex-col text-white
      gap-9 max-[767px]:w-[fit-content] max-[767px]:last:w-[70%] ${propClass}`}>
      {links.map((link) => (
        <Link
          //? Close hamburger menu
          onClick={() => setIsMenuOpen && setIsMenuOpen(false)}
          href={link.href}
          className={`w-[fit-content] hover:bg-slate-500 hover:text-zinc/60 px-3 py-1 rounded-md text-sm font-medium cursor-pointer text-[1.1rem]
          ${currentPath === link.href
              ? "bg-slate-700 cursor-default shadow-1 text-lime-300/70 hover:text-lime-300/80"
              : ""
            }`}
          key={link.label}>
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export default DropdownMenu
