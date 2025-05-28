import { EditorPage } from "@/app/course/edit/editorPage"

export default async function Edit(props: { params: Promise<{ courseId: number }> }) {
  const params = await props.params
  const { courseId } = params

  return (
    <EditorPage
      params={Promise.resolve({ courseId })}
    />
  )
}
