import type React from "react"
import type {
  SelectCompetitionWithCourse,
  SelectCourseWithCompetition,
  SelectJudge,
  SelectJudgeWithCompetition,
  SelectPlayer,
  SelectPlayerWithCompetition,
} from "@/app/lib/db/schema"

type CommonListProps = {
  type: "player" | "judge" | "course" | "competition"
  commonDataList:
    | SelectPlayer[]
    | SelectJudge[]
    | SelectCompetitionWithCourse[]
    | SelectPlayerWithCompetition[]
    | SelectJudgeWithCompetition[]
}

function TableComponent({
  type,
  common,
  onCourseCompetitionClick,
}: {
  type: CommonListProps["type"]
  common:
    | SelectPlayer
    | SelectJudge
    | SelectCompetitionWithCourse
    | SelectPlayerWithCompetition
    | SelectJudgeWithCompetition
  onCourseCompetitionClick?: (names: string[]) => void
}) {
  return (
    <>
      {type === "player" && (
        <>
          <td className="py-3">
            {(common as SelectPlayerWithCompetition).bibNumber}
          </td>
          <td className="py-3">
            {(common as SelectPlayerWithCompetition).furigana}
          </td>
          <td className="py-3 font-medium">
            {(common as SelectPlayerWithCompetition).name}
          </td>
          <td className="py-3">
            {(common as SelectPlayerWithCompetition).competitionName?.map(
              (name) => (
                <span key={name} className="badge badge-ghost badge-sm mr-1">
                  {name}
                </span>
              ),
            )}
          </td>
        </>
      )}
      {type === "judge" && (
        <>
          <td className="py-3 font-mono text-base-content/50 text-xs">
            {(common as SelectJudgeWithCompetition).id}
          </td>
          <td className="py-3 font-medium">
            {(common as SelectJudgeWithCompetition).name}
          </td>
          <td className="py-3">
            {(common as SelectJudgeWithCompetition).competitionName?.map(
              (name) => (
                <span key={name} className="badge badge-ghost badge-sm mr-1">
                  {name}
                </span>
              ),
            )}
          </td>
        </>
      )}
      {type === "course" && (
        <>
          <td className="py-3 font-mono text-base-content/50 text-xs">
            {(common as SelectCourseWithCompetition).id}
          </td>
          <td className="py-3 font-medium">
            {(common as SelectCourseWithCompetition).name}
          </td>
          <td className="py-3">
            {(common as SelectCourseWithCompetition).competitionName?.length ? (
              <button
                type="button"
                className="badge badge-primary badge-outline cursor-pointer transition-colors hover:bg-primary hover:text-primary-content"
                onClick={(e) => {
                  e.stopPropagation()
                  onCourseCompetitionClick?.(
                    (common as SelectCourseWithCompetition).competitionName ??
                      [],
                  )
                }}
              >
                {
                  (common as SelectCourseWithCompetition).competitionName
                    ?.length
                }
              </button>
            ) : (
              <span className="text-base-content/30 text-sm">0</span>
            )}
          </td>
          <td className="max-w-48 py-3">
            {(common as SelectCourseWithCompetition).description ? (
              <span className="line-clamp-2 text-base-content/70 text-sm">
                {(common as SelectCourseWithCompetition).description}
              </span>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
            )}
          </td>
          <td
            className="py-3 text-base-content/60 text-sm"
            suppressHydrationWarning={true}
          >
            {(common as SelectCourseWithCompetition).createdAt?.toLocaleString(
              "ja-JP",
            )}
          </td>
        </>
      )}
      {type === "competition" && (
        <>
          <td className="py-3 font-mono text-base-content/50 text-xs">
            {(common as SelectCompetitionWithCourse).id}
          </td>
          <td className="py-3 font-medium">
            {(common as SelectCompetitionWithCourse).name}
          </td>
          <td className="py-3">
            {(common as SelectCompetitionWithCourse).courseNames?.length > 0 ? (
              (common as SelectCompetitionWithCourse).courseNames.map(
                (name) => (
                  <span key={name} className="badge badge-ghost badge-sm mr-1">
                    {name}
                  </span>
                ),
              )
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
            )}
          </td>
          <td className="max-w-48 py-3">
            {(common as SelectCompetitionWithCourse).description ? (
              <span className="line-clamp-2 text-base-content/70 text-sm">
                {(common as SelectCompetitionWithCourse).description}
              </span>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
            )}
          </td>
          <td
            className="py-3 text-base-content/60 text-sm"
            suppressHydrationWarning
          >
            {(common as SelectCompetitionWithCourse).startDate ? (
              new Date(
                (common as SelectCompetitionWithCourse).startDate as Date,
              ).toLocaleDateString("ja-JP")
            ) : (
              <span className="text-base-content/30">-</span>
            )}
          </td>
          <td
            className="py-3 text-base-content/60 text-sm"
            suppressHydrationWarning
          >
            {(common as SelectCompetitionWithCourse).endDate ? (
              new Date(
                (common as SelectCompetitionWithCourse).endDate as Date,
              ).toLocaleDateString("ja-JP")
            ) : (
              <span className="text-base-content/30">-</span>
            )}
          </td>
        </>
      )}
    </>
  )
}

function itemNames(type: CommonListProps["type"]): string[] {
  const itemNames: string[] = []
  if (type === "player") {
    itemNames.push("ゼッケン番号", "ふりがな", "名前", "参加大会")
  } else if (type === "judge") {
    itemNames.push("ID", "名前", "参加大会")
  } else if (type === "course") {
    itemNames.push("ID", "コース名", "使用大会", "説明", "作成日時")
  } else if (type === "competition") {
    itemNames.push("ID", "名前", "コース", "説明", "開催日", "終了日")
  }
  return itemNames
}

function typeLabel(type: CommonListProps["type"]): string | null {
  switch (type) {
    case "player":
      return "選手"
    case "judge":
      return "採点者"
    case "course":
      return "コース"
    case "competition":
      return "大会"
    default:
      return null
  }
}

function emptyLabel(
  type: CommonListProps["type"],
  selectionMode: "radio" | "checkbox",
): string {
  if (selectionMode === "checkbox" && type === "competition") {
    return "大会"
  }
  return typeLabel(type) ?? "割当"
}

export function CommonSelectionList({
  props: { type, commonDataList },
  selectionMode,
  selectedId,
  onSelect,
  onCourseCompetitionClick,
}: {
  props: CommonListProps
  selectionMode: "radio" | "checkbox"
  selectedId: number | null | number[]
  onSelect: (id: number) => void
  onCourseCompetitionClick?: (names: string[]) => void
}) {
  function isChecked(id: number): boolean {
    if (selectionMode === "radio") {
      return selectedId === id
    }
    return Array.isArray(selectedId) && selectedId.includes(id)
  }

  return (
    <>
      {type !== "competition" && type !== "course" && (
        <h2 className="text-center font-semibold text-xl">
          {typeLabel(type)}一覧
        </h2>
      )}
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <div className="m-3 min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-base-300/50">
          <table className="table-pin-rows table-zebra table">
            <thead>
              <tr className="border-base-300/50 border-b bg-base-200/60">
                <th className="w-12">
                  <label>
                    <input
                      type={selectionMode}
                      disabled={true}
                      className="opacity-0"
                    />
                  </label>
                </th>
                {itemNames(type).map((name) => (
                  <th
                    key={name}
                    className="py-3 font-semibold text-base-content/50 text-xs uppercase tracking-wider"
                    hidden={
                      selectionMode === "radio" &&
                      type === "player" &&
                      name === "参加大会"
                    }
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commonDataList.length > 0 ? (
                commonDataList.map((common) => (
                  <tr
                    key={common.id}
                    className="cursor-pointer transition-colors duration-150 hover:bg-primary/5"
                    onClick={() => onSelect(common.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onSelect(common.id)
                      }
                    }}
                  >
                    <th className="w-12">
                      <label>
                        <input
                          type={selectionMode}
                          name="selectedCommon"
                          value={common.id}
                          checked={isChecked(common.id)}
                          onChange={() => onSelect(common.id)}
                          className={`size-4 ${selectionMode === "checkbox" ? "checkbox checkbox-primary" : ""}`}
                        />
                      </label>
                    </th>
                    <TableComponent
                      type={type}
                      common={common}
                      onCourseCompetitionClick={onCourseCompetitionClick}
                    />
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={itemNames(type).length + 1}
                    className="py-12 text-center text-base-content/40"
                  >
                    {emptyLabel(type, selectionMode)}が登録されていません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function CommonRadioList({
  props,
  commonId,
  setCommonId,
}: {
  props: CommonListProps
  commonId: number | null
  setCommonId: React.Dispatch<React.SetStateAction<number | null>>
}) {
  return (
    <CommonSelectionList
      props={props}
      selectionMode="radio"
      selectedId={commonId}
      onSelect={(id) => setCommonId(id)}
    />
  )
}

export function CommonCheckboxList({
  props,
  commonId,
  setCommonId,
  onCourseCompetitionClick,
}: {
  props: CommonListProps
  commonId: number[]
  setCommonId: React.Dispatch<React.SetStateAction<number[]>>
  onCourseCompetitionClick?: (names: string[]) => void
}) {
  function handleToggle(id: number) {
    if (!commonId) {
      setCommonId([id])
    } else if (commonId.includes(id)) {
      setCommonId(commonId.filter((c) => c !== id))
    } else {
      setCommonId([...commonId, id])
    }
  }

  return (
    <CommonSelectionList
      props={props}
      selectionMode="checkbox"
      selectedId={commonId}
      onSelect={handleToggle}
      onCourseCompetitionClick={onCourseCompetitionClick}
    />
  )
}
