"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState } from "react"
import {
  COMPETITION_MANAGEMENT_LIST,
  HOME_CONST,
  SIGN_IN_CONST,
  SIGN_OUT_CONST,
} from "@/app/lib/const"

const DropdownMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { status } = useSession()

  return (
    <nav className="flex">
      <button
        type="button"
        className="btn btn-primary p-2 text-xl"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg
          className="block h-6 w-6 fill-current"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Mobile menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
        </svg>
        <p className="hidden lg:inline">メニュー</p>
      </button>
      <div
        className={`${isMenuOpen ? "flex" : "hidden"
          } absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:items-center lg:w-auto lg:space-x-6`}
      ></div>
      {isMenuOpen && (
        <div className="navbar-menu relative z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="navbar-backdrop fixed inset-0 bg-neutral-800 opacity-75"
            onClick={() => setIsMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsMenuOpen(false)
              }
            }}
            tabIndex={0}
          />
          <div className="fixed top-0 left-0 bottom-0 flex flex-col w-4/6 max-w-sm py-6 px-6 bg-neutral-500/90 overflow-y-auto">
            <div className="flex items-center mb-8">
              <Link href="/">
                <div className="mr-auto text-3xl font-bold leading-none">
                  <div className="textShadow_wt text-white text-[2.2rem] font-bold text-nowrap max-[1000px]:text-[1.4rem] ">
                    メニュー
                  </div>
                </div>
              </Link>
              <button
                type="button"
                className="navbar-close ml-14"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg
                  className="h-6 w-6 text-neutral-950 cursor-pointer hover:text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Close menu</title>
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div>
              <NavLinks status={status} setIsMenuOpen={setIsMenuOpen} />
              {status === "authenticated" ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    signOut({ redirect: true, redirectTo: "/" })
                  }}
                  className="flex mt-10 w-[fit-content] hover:bg-slate-500 hover:text-zinc/60 text-white px-3 py-1 rounded-md text-sm font-medium cursor-pointer text-[1.1rem]"
                >
                  {SIGN_OUT_CONST.icon}
                  {SIGN_OUT_CONST.label}
                </button>
              ) : (
                <Link
                  onClick={() => {
                    setIsMenuOpen(false)
                  }}
                  href={SIGN_IN_CONST.href}
                  className="flex mt-10 w-[fit-content] hover:bg-slate-500 hover:text-zinc/60 text-white px-3 py-1 rounded-md text-sm font-medium cursor-pointer text-[1.1rem]"
                >
                  {SIGN_IN_CONST.icon}
                  {SIGN_IN_CONST.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

type PropsType = {
  status: "authenticated" | "unauthenticated" | "loading"
  setIsMenuOpen: (arg0: boolean) => void
}

const NavLinks = ({ status, setIsMenuOpen }: PropsType) => {
  const currentPath = usePathname()
  const links = [HOME_CONST]
  if (status === "authenticated") {
    links.push(...COMPETITION_MANAGEMENT_LIST)
  }

  return (
    <div
      className="flex gap-3 mx-3 flex-col text-white
      gap-9 max-[767px]:w-[fit-content] max-[767px]:last:w-[70%]"
    >
      {links.map((link) => (
        <Link
          onClick={() => setIsMenuOpen(false)}
          href={link.href}
          className={`flex w-[fit-content] hover:bg-slate-500 hover:text-zinc/60 px-3 py-1 rounded-md text-sm font-medium cursor-pointer text-[1.1rem]
          ${currentPath === link.href
              ? "bg-slate-700 cursor-default shadow-1 text-lime-300/70 hover:text-lime-300/80"
              : ""
            }`}
          key={link.label}
        >
          {link.icon}
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export default DropdownMenu
