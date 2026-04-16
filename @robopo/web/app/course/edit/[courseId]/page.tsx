import type { Metadata } from "next"
import { EditorPage } from "@/app/course/edit/editorPage"
import { getCourseById } from "@/lib/db/queries/queries"

export const metadata: Metadata = {
  title: "コース編集",
  description: "コースを編集します",
}

export default async function Edit({
  params,
}: {
  params: Promise<{ courseId: number }>
}) {
  const { courseId } = await params
  const courseData = await getCourseById(courseId)

  return <EditorPage courseData={courseData} />
}
