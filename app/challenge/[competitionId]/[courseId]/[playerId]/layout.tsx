import { AudioProvider } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
import type React from "react"

export default function Layout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <AudioProvider>
      {children}
      {modal}
    </AudioProvider>
  )
}
