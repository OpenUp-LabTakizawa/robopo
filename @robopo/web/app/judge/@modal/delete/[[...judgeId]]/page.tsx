import { DeleteModal } from "@/app/components/common/commonModal"

export default async function Delete({
  params,
}: {
  params: Promise<{ judgeId: number[] }>
}) {
  const { judgeId } = await params

  return <DeleteModal type="judge" ids={judgeId} />
}
