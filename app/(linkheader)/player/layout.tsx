import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { UnloadProvider } from "@/app/components/beforeUnload/provider"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default function Layout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <UnloadProvider>
      {children}
      {modal}
    </UnloadProvider>
  )
}
