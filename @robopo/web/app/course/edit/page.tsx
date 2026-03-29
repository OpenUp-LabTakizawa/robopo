import { EditorPage } from "@/app/course/edit/editorPage"

export default async function NewEdit() {
  return (
    <EditorPage
      courseData={null} // Set courseData to null for new course creation
    />
  )
}
