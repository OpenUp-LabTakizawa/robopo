import { DeleteModal } from "@/app/components/common/commonModal"

export default async function Delete({
  params,
}: {
  params: Promise<{ playerId: number[] }>
}) {
  const { playerId } = await params

  return <DeleteModal type="player" ids={playerId} />
}
