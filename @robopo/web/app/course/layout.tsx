import { CourseEditProvider } from "@/app/course/edit/courseEditContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CourseEditProvider>{children}</CourseEditProvider>
}
