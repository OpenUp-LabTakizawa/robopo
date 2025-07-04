"use client"

import { useRouter } from "next/navigation"
import { ArrowPathIcon, HomeIcon } from "@heroicons/react/24/outline"

export const ReloadButton = () => {
    return (
        <button className="btn btn-primary min-w-28 max-w-fit mx-auto mt-5" onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-6 h-6" />
            再読み込み
        </button>
    )
}

export const HomeButton = () => {
    const router = useRouter()
    return (
        <button className="btn btn-primary min-w-28 max-w-fit mx-auto m-5" onClick={() => router.push("/")}>
            <HomeIcon className="w-6 h-6" />
            ホーム
        </button>
    )
}
