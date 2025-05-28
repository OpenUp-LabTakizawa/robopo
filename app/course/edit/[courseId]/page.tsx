import { EditorPage } from "@/app/course/edit/editorPage"

export default async function Edit(props: { params: Promise<{ courseId: number }> }) {
  const { courseId } = await props.params

  return (
    <EditorPage
      params={Promise.resolve({ courseId })}
    />
  )
}
