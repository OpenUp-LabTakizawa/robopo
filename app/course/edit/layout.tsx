import { Suspense } from "react"
import "@/app/globals.css"
import { PageLoading } from "@/app/components/parts/pageLoading"

export default function Layout({
  children,
}: // modal
  Readonly<{
    children: React.ReactNode
  }>) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}
