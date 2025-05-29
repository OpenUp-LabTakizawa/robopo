import type { Metadata } from "next"
import { AudioProvider } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
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
    <AudioProvider>
      {children}
      {modal}
    </AudioProvider>
  )
}
