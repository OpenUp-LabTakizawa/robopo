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

export function DropdownMenu() {
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
        className={`${isMenuOpen ? "flex" : "hidden"} -translate-y-1/2 -translate-x-1/2 absolute top-1/2 left-1/2 transform lg:mx-auto lg:flex lg:w-auto lg:items-center lg:space-x-6`}
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
          <div className="fixed top-0 bottom-0 left-0 flex w-4/6 max-w-sm flex-col overflow-y-auto bg-neutral-500/90 px-6 py-6">
            <div className="mb-8 flex items-center">
              <Link href="/">
                <div className="mr-auto font-bold text-3xl leading-none">
                  <div className="textShadow_wt text-nowrap font-bold text-[2.2rem] text-white max-[1000px]:text-[1.4rem]">
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
                  className="h-6 w-6 cursor-pointer text-neutral-950 hover:text-gray-700"
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
                  className="mt-10 flex w-fit cursor-pointer rounded-md px-3 py-1 font-medium text-[1.1rem] text-sm text-white hover:bg-slate-500 hover:text-zinc/60"
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
                  className="mt-10 flex w-fit cursor-pointer rounded-md px-3 py-1 font-medium text-[1.1rem] text-sm text-white hover:bg-slate-500 hover:text-zinc/60"
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

function NavLinks({ status, setIsMenuOpen }: PropsType) {
  const currentPath = usePathname()
  const links = [HOME_CONST]
  if (status === "authenticated") {
    links.push(...COMPETITION_MANAGEMENT_LIST)
  }

  return (
    <div className="mx-3 flex flex-col gap-3 gap-9 text-white max-[767px]:w-fit max-[767px]:last:w-[70%]">
      {links.map((link) => (
        <Link
          onClick={() => setIsMenuOpen(false)}
          href={link.href}
          className={`flex w-fit cursor-pointer rounded-md px-3 py-1 font-medium text-[1.1rem] text-sm hover:bg-slate-500 hover:text-zinc/60 ${
            currentPath === link.href
              ? "cursor-default bg-slate-700 text-lime-300/70 shadow-1 hover:text-lime-300/80"
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
