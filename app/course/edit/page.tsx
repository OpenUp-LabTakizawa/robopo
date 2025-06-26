import { EditorPage } from "@/app/course/edit/editorPage"

export default async function NewEdit() {
  return (
    <EditorPage
      courseData={null} // 新規作成時は courseData を null に設定
    />
  )
}
