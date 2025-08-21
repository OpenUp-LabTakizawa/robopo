import { EditorPage } from "@/app/course/edit/editorPage"
import { getCourseById } from "@/app/lib/db/queries/queries"

export default async function Edit({
  params,
}: {
  params: Promise<{ courseId: number }>
}) {
  const { courseId } = await params
  const courseData = await getCourseById(courseId)

  return <EditorPage courseData={courseData} />
}
