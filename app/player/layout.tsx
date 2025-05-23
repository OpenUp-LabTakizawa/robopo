import type { Metadata } from "next"
import "@/app/globals.css"

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
    <>
      {children}
      {modal}
    </>
  )
}
