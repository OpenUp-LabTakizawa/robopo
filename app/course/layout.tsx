import { NavigationGuardProvider } from "next-navigation-guard"
import { CourseEditProvider } from "@/app/course/edit/courseEditContext"
import "@/app/globals.css"

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
