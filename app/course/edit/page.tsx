import { EditorPage } from "@/app/course/edit/editorPage"

export default async function NewEdit() {
  return (
    <EditorPage
      params={Promise.resolve({ courseId: null })}
    />
  )
}
