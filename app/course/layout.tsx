import { CourseEditProvider } from "@/app/course/edit/courseEditContext"
import type { Metadata } from "next"
import { NavigationGuardProvider } from "next-navigation-guard"
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
    <NavigationGuardProvider>
      <CourseEditProvider>
        {children}
        {modal}
      </CourseEditProvider>
    </NavigationGuardProvider>
  )
}
