"use client"

import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

export function ReloadButton() {
  return (
    <button
      type="button"
      className="btn btn-primary mx-auto mt-5 min-w-28 max-w-fit"
      onClick={() => window.location.reload()}
    >
      <ArrowPathIcon className="size-6" />
      再読み込み
    </button>
  )
}

export function HomeButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      className="btn btn-primary m-5 mx-auto min-w-28 max-w-fit"
      onClick={() => router.push("/")}
    >
      <HomeIcon className="size-6" />
      ホーム
    </button>
  )
}
