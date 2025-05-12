import { DeleteModal } from "@/app/components/common/commonModal"

export default async function Delete({ params }: { params: Promise<{ umpireId: number[] }> }) {
  const umpireId = await (await params).umpireId

  return <DeleteModal type="umpire" ids={umpireId} />
}
