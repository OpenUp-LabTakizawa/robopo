import { DeleteModal } from "@/components/common/commonModal"

export default async function Delete({
  params,
}: {
  params: Promise<{ courseId: number[] }>
}) {
  const { courseId } = await params

  return <DeleteModal type="course" ids={courseId} />
}
