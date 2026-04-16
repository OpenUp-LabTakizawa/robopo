import type { Metadata } from "next"
import { EditorPage } from "@/app/course/edit/editorPage"

export const metadata: Metadata = {
  title: "コース作成",
  description: "新しいコースを作成します",
}

export default async function NewEdit() {
  return (
    <EditorPage
      courseData={null} // Set courseData to null for new course creation
    />
  )
}
