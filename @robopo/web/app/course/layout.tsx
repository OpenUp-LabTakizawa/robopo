import { CourseEditProvider } from "@/app/course/edit/courseEditContext"

export default function Layout(props: LayoutProps<"/course">) {
  return (
    <CourseEditProvider>
      {props.children}
      {props.modal}
    </CourseEditProvider>
  )
}
