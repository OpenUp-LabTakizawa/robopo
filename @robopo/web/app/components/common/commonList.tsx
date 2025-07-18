import type React from "react"
import type {
  SelectCompetition,
  SelectCourseWithCompetition,
  SelectPlayer,
  SelectPlayerWithCompetition,
  SelectUmpire,
  SelectUmpireWithCompetition,
} from "@/app/lib/db/schema"

type CommonListProps = {
  type: "player" | "umpire" | "course" | "competition"
  commonDataList:
    | SelectPlayer[]
    | SelectUmpire[]
    | SelectCompetition[]
    | SelectPlayerWithCompetition[]
    | SelectUmpireWithCompetition[]
}

function TableComponent({
  type,
  common,
}: {
  type: CommonListProps["type"]
  common:
    | SelectPlayer
    | SelectUmpire
    | SelectCompetition
    | SelectPlayerWithCompetition
    | SelectUmpireWithCompetition
}) {
  return (
    <>
      {type === "player" && (
        <>
          {/* <td>{(common as SelectPlayerWithCompetition).id}</td> */}
          <td>{(common as SelectPlayerWithCompetition).zekken}</td>
          <td>{(common as SelectPlayerWithCompetition).furigana}</td>
          <td>{(common as SelectPlayerWithCompetition).name}</td>
          <td>
            {(common as SelectPlayerWithCompetition).competitionName?.map(
              (name) => (
                <div key={name}>{name}</div>
              ),
            )}
          </td>
          {/* <td>{(common as SelectPlayerWithCompetition).qr}</td> */}
        </>
      )}
      {type === "umpire" && (
        <>
          <td>{(common as SelectUmpireWithCompetition).id}</td>
          <td>{(common as SelectUmpireWithCompetition).name}</td>
          <td>
            {(common as SelectUmpireWithCompetition).competitionName?.map(
              (name) => (
                <div key={name}>{name}</div>
              ),
            )}
          </td>
        </>
      )}
      {type === "course" && (
        <>
          <td>{(common as SelectCourseWithCompetition).id}</td>
          <td>{(common as SelectCourseWithCompetition).name}</td>
          <td suppressHydrationWarning={true}>
            {(common as SelectCourseWithCompetition).createdAt?.toLocaleString(
              "ja-JP",
            )}
          </td>
          <td>
            {(common as SelectCourseWithCompetition).competitionName?.map(
              (name) => (
                <div key={name}>{name}</div>
              ),
            )}
          </td>
        </>
      )}
      {type === "competition" && (
        <>
          <td>{(common as SelectCompetition).id}</td>
          <td>{(common as SelectCompetition).name}</td>
          <td>
            {(common as SelectCompetition).step === 0
              ? "開催前"
              : (common as SelectCompetition).step === 1
                ? "開催中"
                : "終了済"}
          </td>
        </>
      )}
    </>
  )
}

function itemNames(type: CommonListProps["type"]): string[] {
  const itemNames: string[] = []
  if (type === "player") {
    itemNames.push("ゼッケン番号", "ふりがな", "名前", "参加大会")
  } else if (type === "umpire") {
    itemNames.push("ID", "名前", "参加大会")
  } else if (type === "course") {
    itemNames.push("ID", "コース名", "作成日時", "使用大会")
  } else if (type === "competition") {
    itemNames.push("ID", "名前", "開催中")
  }
  return itemNames
}

export function CommonRadioList({
  props: { type, commonDataList },
  commonId,
  setCommonId,
}: {
  props: CommonListProps
  commonId: number | null
  setCommonId: React.Dispatch<React.SetStateAction<number | null>>
}) {
  function handleRadioSelect(event: React.ChangeEvent<HTMLInputElement>) {
    setCommonId(Number(event.target.value))
  }

  return (
    <>
      {type !== "competition" && (
        <h2 className="text-center font-semibold text-xl">
          {type === "player"
            ? "選手"
            : type === "umpire"
              ? "採点者"
              : type === "course"
                ? "コース"
                : null}
          一覧
        </h2>
      )}
      <div className="w-full">
        <div className="m-3 max-h-96 overflow-x-auto overflow-y-auto border sm:h-96">
          <table className="table-pin-rows table">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="radio" disabled={true} />
                  </label>
                </th>
                {itemNames(type).map((name) => (
                  <th
                    key={name}
                    hidden={type === "player" && name === "参加大会"}
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
                    className="hover cursor-pointer"
                    onClick={() => setCommonId(common.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Space") {
                        setCommonId(common.id)
                      }
                    }}
                    hidden={common.id < 0}
                  >
                    <th>
                      <label>
                        <input
                          type="radio"
                          name="selectedCommon"
                          value={common.id}
                          checked={commonId === common.id}
                          onChange={handleRadioSelect}
                          className="size-4"
                        />
                      </label>
                    </th>
                    <TableComponent type={type} common={common} />
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    {type === "player"
                      ? "選手"
                      : type === "umpire"
                        ? "採点者"
                        : type === "competition"
                          ? "大会"
                          : null}
                    が登録されていません。
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

export function CommonCheckboxList({
  props: { type, commonDataList },
  commonId,
  setCommonId,
}: {
  props: CommonListProps
  commonId: number[]
  setCommonId: React.Dispatch<React.SetStateAction<number[]>>
}) {
  function handleCheckboxChange(id: number) {
    if (!commonId) {
      setCommonId([id])
    } else if (commonId.includes(id)) {
      setCommonId(commonId.filter((common) => common !== id))
    } else {
      setCommonId([...commonId, id])
    }
  }

  return (
    <>
      {type !== "competition" && (
        <h2 className="text-center font-semibold text-xl">
          {type === "player"
            ? "選手"
            : type === "umpire"
              ? "採点者"
              : type === "course"
                ? "コース"
                : null}
          一覧
        </h2>
      )}
      <div className="w-full">
        <div className="m-3 max-h-96 overflow-x-auto overflow-y-auto border sm:h-96">
          <table className="table-pin-rows table">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" disabled={true} />
                  </label>
                </th>
                {itemNames(type).map((name) => (
                  <th key={name}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commonDataList.length > 0 ? (
                commonDataList.map((common) => (
                  <tr
                    key={common.id}
                    className="hover cursor-pointer"
                    onClick={() => handleCheckboxChange(common.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "") {
                        handleCheckboxChange(common.id)
                      }
                    }}
                    hidden={common.id < 0}
                  >
                    <th>
                      <label>
                        <input
                          type="checkbox"
                          name="selectedCommon"
                          value={common.id}
                          checked={commonId?.includes(common.id)}
                          onChange={() => handleCheckboxChange(common.id)}
                          className="h-4 w-4"
                        />
                      </label>
                    </th>
                    <TableComponent type={type} common={common} />
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    {type === "player"
                      ? "選手"
                      : type === "umpire"
                        ? "採点者"
                        : type === "course"
                          ? "コース"
                          : type === "competition"
                            ? "大会"
                            : "割当"}
                    が登録されていません。
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
