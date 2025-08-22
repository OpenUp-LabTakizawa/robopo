import { NavigationGuardProvider } from "next-navigation-guard"
import { CourseEditProvider } from "@/app/course/edit/courseEditContext"

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
