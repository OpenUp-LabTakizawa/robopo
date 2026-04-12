import { getJudgeSummaryByCompetition } from "@/app/lib/db/queries/queries"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await params
  const competitionIdNum = Number(competitionId)

  const judgeSummary = await getJudgeSummaryByCompetition(competitionIdNum)

  return Response.json(judgeSummary)
}
