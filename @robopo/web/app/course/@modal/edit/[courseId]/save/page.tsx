import { SaveModal } from "@/app/components/course/modals"

export default async function SavePage(props: { params: Promise<{ courseId: number }> }) {
  const { courseId } = await props.params
  return (
    <SaveModal courseId={courseId} />
  )
}
