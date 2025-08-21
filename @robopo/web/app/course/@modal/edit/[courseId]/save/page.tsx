import { SaveModal } from "@/app/components/course/modals"

export default async function SavePage({
  params,
}: {
  params: Promise<{ courseId: number }>
}) {
  const { courseId } = await params
  return <SaveModal courseId={courseId} />
}
