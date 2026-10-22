import type { SelectCompetition } from "@/lib/db/schema"

type CompetitionCheckboxListProps = {
  competitionList: SelectCompetition[]
  selectedIds: number[]
  onToggle: (id: number) => void
}

export function CompetitionCheckboxList({
  competitionList,
  selectedIds,
  onToggle,
}: CompetitionCheckboxListProps) {
  return (
    <div>
      <span className="label">
        <span className="label-text">大会紐付け</span>
      </span>
      {competitionList.length > 0 ? (
        <div className="border-base-300/50 bg-base-200/30 max-h-[8.5rem] overflow-y-auto rounded-xl border">
          {competitionList.map((c) => (
            <label
              key={c.id}
              className="hover:bg-base-200/60 flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition-colors"
            >
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={selectedIds.includes(c.id)}
                onChange={() => onToggle(c.id)}
              />
              <span className="text-sm">{c.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="bg-base-200/30 text-base-content/40 rounded-xl px-3 py-2 text-sm">
          大会が登録されていません
        </p>
      )}
      <p className="text-base-content/40 mt-1 text-xs">
        紐付けは任意です（0件でも可）
      </p>
    </div>
  )
}
