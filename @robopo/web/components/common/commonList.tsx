import type React from "react"
import type {
  SelectCompetitionWithCourse,
  SelectCourseWithCompetition,
  SelectJudgeWithCompetition,
  SelectPlayerWithCompetition,
} from "@/lib/db/schema"

type CommonListProps = {
  type: "player" | "judge" | "course" | "competition"
  commonDataList:
    | SelectCompetitionWithCourse[]
    | SelectPlayerWithCompetition[]
    | SelectJudgeWithCompetition[]
    | SelectCourseWithCompetition[]
}

function TableComponent({
  type,
  common,
  onCourseCompetitionClick,
}: {
  type: CommonListProps["type"]
  common:
    | SelectCompetitionWithCourse
    | SelectPlayerWithCompetition
    | SelectJudgeWithCompetition
    | SelectCourseWithCompetition
  onCourseCompetitionClick?: (names: string[]) => void
}) {
  return (
    <>
      {type === "player" && (
        <>
          <td className="py-3 font-mono text-base-content/50 text-xs">
            {(common as SelectPlayerWithCompetition).id}
          </td>
          <td className="py-3">
            {(common as SelectPlayerWithCompetition).bibNumber || (
              <span className="text-base-content/30 text-sm">-</span>
            )}
          </td>
          <td className="py-3">
            {(common as SelectPlayerWithCompetition).furigana || (
              <span className="text-base-content/30 text-sm">-</span>
            )}
          </td>
          <td className="py-3 font-medium">
            {(common as SelectPlayerWithCompetition).name}
          </td>
          <td className="py-3">
            {(common as SelectPlayerWithCompetition).competitionName?.length ? (
              <div className="flex flex-col gap-1">
                {(common as SelectPlayerWithCompetition).competitionName?.map(
                  (name) => (
                    <span key={name} className="badge badge-ghost badge-sm">
                      {name}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
            )}
          </td>
          <td className="max-w-xs py-3">
            {(common as SelectPlayerWithCompetition).note ? (
              <span className="line-clamp-2 text-base-content/70 text-sm">
                {(common as SelectPlayerWithCompetition).note}
              </span>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
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
            {(common as SelectJudgeWithCompetition).username}
          </td>
          <td className="py-3">
            {(common as SelectJudgeWithCompetition).competitionName?.length ? (
              <div className="flex flex-col gap-1">
                {(common as SelectJudgeWithCompetition).competitionName?.map(
                  (name) => (
                    <span key={name} className="badge badge-ghost badge-sm">
                      {name}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
            )}
          </td>
          <td
            className="whitespace-nowrap py-3 text-base-content/60 text-sm"
            suppressHydrationWarning={true}
          >
            {(common as SelectJudgeWithCompetition).lastLoginAt ? (
              new Date(
                (common as SelectJudgeWithCompetition).lastLoginAt as Date,
              ).toLocaleString("ja-JP")
            ) : (
              <span className="text-base-content/30">-</span>
            )}
          </td>
          <td className="max-w-xs py-3">
            {(common as SelectJudgeWithCompetition).note ? (
              <span className="line-clamp-2 text-base-content/70 text-sm">
                {(common as SelectJudgeWithCompetition).note}
              </span>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
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
            {(common as SelectCourseWithCompetition).isConfigured ? (
              <span className="text-lg text-red-500">○</span>
            ) : (
              <span className="text-blue-500 text-lg">✕</span>
            )}
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
          <td
            className="py-3 text-base-content/60 text-sm"
            suppressHydrationWarning={true}
          >
            {(common as SelectCourseWithCompetition).createdAt?.toLocaleString(
              "ja-JP",
            )}
          </td>
          <td className="min-w-64 max-w-sm py-3">
            {(common as SelectCourseWithCompetition).description ? (
              <span className="line-clamp-3 text-base-content/70 text-sm">
                {(common as SelectCourseWithCompetition).description}
              </span>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
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
              <div className="flex flex-col gap-1">
                {(common as SelectCompetitionWithCourse).courseNames.map(
                  (name) => (
                    <span key={name} className="badge badge-ghost badge-sm">
                      {name}
                    </span>
                  ),
                )}
              </div>
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
          <td className="min-w-64 max-w-sm py-3">
            {(common as SelectCompetitionWithCourse).description ? (
              <span className="line-clamp-3 text-base-content/70 text-sm">
                {(common as SelectCompetitionWithCourse).description}
              </span>
            ) : (
              <span className="text-base-content/30 text-sm">-</span>
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
    itemNames.push(
      "ID",
      "ゼッケン番号",
      "ふりがな",
      "名前",
      "紐付け大会",
      "備考",
    )
  } else if (type === "judge") {
    itemNames.push("ID", "ユーザー名", "紐付け大会", "ログイン日時", "備考")
  } else if (type === "course") {
    itemNames.push("ID", "コース名", "設定済み", "使用大会", "作成日時", "説明")
  } else if (type === "competition") {
    itemNames.push("ID", "名前", "コース", "開催日", "終了日", "説明")
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
