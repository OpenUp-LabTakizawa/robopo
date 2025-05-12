import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import "@/app/globals.css"
import { PageLoading } from "@/app/components/parts/pageLoading"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default function Layout({
  children,
}: // modal
  Readonly<{
    children: React.ReactNode
  }>) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}
