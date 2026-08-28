"use client"

import Image from "next/image"
import Link from "next/link"
import { useNavigationGuard } from "@/hooks/useNavigationGuard"

// The brand never depends on the session, so the root layout renders it outside
// the header's Suspense boundary. Keeping it in the static shell means the logo
// request is issued while the initial document is parsed, instead of when the
// streamed chunk for the boundary lands.
export function HeaderLogo() {
  const { isDirty } = useNavigationGuard()

  const logoContent = (
    <>
      <Image
        src="/logo.png"
        alt="ROBOPO Logo"
        width={36}
        height={36}
        priority
        className="h-auto max-w-full"
      />
      <span className="font-bold text-lg text-primary">ROBOPO</span>
    </>
  )

  return isDirty ? (
    <a href="/" className="flex items-center gap-2">
      {logoContent}
    </a>
  ) : (
    <Link href="/" className="flex items-center gap-2">
      {logoContent}
    </Link>
  )
}
