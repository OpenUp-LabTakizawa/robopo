import { NavigationGuardProvider } from "next-navigation-guard"
import { CourseEditProvider } from "@/app/course/edit/courseEditContext"

export default function Layout(props: LayoutProps<"/course">) {
  return (
    <NavigationGuardProvider>
      <CourseEditProvider>
        {props.children}
        {props.modal}
      </CourseEditProvider>
    </NavigationGuardProvider>
  )
}
