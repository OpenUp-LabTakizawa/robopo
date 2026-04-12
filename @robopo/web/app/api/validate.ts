// Sanitize competitionIds: filter to finite numbers and deduplicate
export function sanitizeCompetitionIds(ids: unknown): number[] | null {
  if (!Array.isArray(ids)) {
    return null
  }
  return [
    ...new Set(
      ids.filter((id) => typeof id === "number" && Number.isFinite(id)),
    ),
  ]
}
