import { DeleteModal } from "@/app/components/common/commonModal"

export default async function Delete({ params }: { params: Promise<{ playerId: number[] }> }) {
  const playerId = await (await params).playerId

  return <DeleteModal type="player" ids={playerId} />
}
