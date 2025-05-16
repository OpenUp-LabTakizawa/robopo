import type { SelectPlayer, SelectUmpire, SelectCompetition, SelectAssignList, SelectPlayerWithCompetition, SelectUmpireWithCompetition, SelectCourseWithCompetition } from "@/app/lib/db/schema"

type commonListProps = {
  type: "player" | "umpire" | "course" | "competition" | "assign"
  commonDataList: SelectPlayer[] | SelectUmpire[] | SelectCompetition[] | SelectAssignList[] | SelectPlayerWithCompetition[] | SelectUmpireWithCompetition[]
}

type radioListProps = {
  props: commonListProps
  commonId: number | null
  setCommonId: React.Dispatch<React.SetStateAction<number | null>>
}

type checkboxListProps = {
  props: commonListProps
  commonId: number[] | null
  setCommonId: React.Dispatch<React.SetStateAction<number[] | null>>
}

const TableComponent = ({
  type,
  common,
}: {
  type: commonListProps["type"]
  common: SelectPlayer | SelectUmpire | SelectCompetition | SelectAssignList | SelectPlayerWithCompetition | SelectUmpireWithCompetition
}) => {
  return (
    <>
      {type === "player" && (
        <>
          {/* <td>{(common as SelectPlayerWithCompetition).id}</td> */}
          <td>{(common as SelectPlayerWithCompetition).zekken}</td>
          <td>{(common as SelectPlayerWithCompetition).furigana}</td>
          <td>{(common as SelectPlayerWithCompetition).name}</td>
          <td>{(common as SelectPlayerWithCompetition).competitionName?.map((name, index) => (<div key={index}>{name}</div>))}</td>
          {/* <td>{(common as SelectPlayerWithCompetition).qr}</td> */}
        </>
      )}
      {type === "umpire" && (
        <>
          <td>{(common as SelectUmpireWithCompetition).id}</td>
          <td>{(common as SelectUmpireWithCompetition).name}</td>
          <td>{(common as SelectUmpireWithCompetition).competitionName?.map((name, index) => (<div key={index}>{name}</div>))}</td>
        </>
      )}
      {type === "course" && (
        <>
          <td>{(common as SelectCourseWithCompetition).id}</td>
          <td>{(common as SelectCourseWithCompetition).name}</td>
          <td suppressHydrationWarning={true}>{(common as SelectCourseWithCompetition).createdAt?.toLocaleString("ja-JP")}</td>
          <td>{(common as SelectCourseWithCompetition).competitionName?.map((name, index) => (<div key={index}>{name}</div>))}</td>
        </>
      )}
      {type === "competition" && (
        <>
          <td>{(common as SelectCompetition).id}</td>
          <td>{(common as SelectCompetition).name}</td>
          <td>{(common as SelectCompetition).step === 0 ? "開催前" : (common as SelectCompetition).step === 1 ? "開催中" : "終了済"}</td>
        </>
      )}
      {type === "assign" && (
        <>
          <td>{(common as SelectAssignList).competition}</td>
          <td>{(common as SelectAssignList).course}</td>
          <td>{(common as SelectAssignList).umpire}</td>
        </>
      )}
    </>
  )
}

const itemNames = (type: commonListProps["type"]): string[] => {
  const itemNames: string[] = []
  if (type === "player") {
    itemNames.push("ゼッケン番号", "ふりがな", "名前", "参加大会")
  } else if (type === "umpire") {
    itemNames.push("ID", "名前", "参加大会")
  } else if (type === "course") {
    itemNames.push("ID", "コース名", "作成日時", "使用大会")
  } else if (type === "competition") {
    itemNames.push("ID", "名前", "開催中")
  } else if (type === "assign") {
    itemNames.push("大会名", "コース名", "採点者名")
  }
  return itemNames
}

export const CommonRadioList = ({ props: { type, commonDataList }, commonId, setCommonId }: radioListProps) => {
  const handleRadioSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommonId(Number(event.target.value))
  }

  return (
    <>
      {type !== "competition" && (
        <h2 className="text-center text-xl font-semibold">
          {type === "player" ? "選手" : type === "umpire" ? "採点者" : type === "course" ? "コース" : type === "assign" ? "割当" : null}一覧
        </h2>
      )}
      <div className="w-full">
        <div className="border overflow-x-auto overflow-y-auto max-h-96 sm:h-96 m-3">
          <table className="table table-pin-rows">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="radio" disabled={true} />
                  </label>
                </th>
                {itemNames(type).map((name) => (
                  <th key={name} hidden={type === "player" && name === "参加大会"}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commonDataList.length > 0 ? (
                commonDataList.map((common) => (
                  <tr key={common.id} className="hover cursor-pointer" onClick={() => setCommonId(common.id)} hidden={common.id < 0}>
                    <th>
                      <label>
                        <input
                          type="radio"
                          name="selectedCommon"
                          value={common.id}
                          checked={commonId === common.id}
                          onChange={handleRadioSelect}
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
                        : type === "competition"
                          ? "大会"
                          : type === "assign"
                            ? "割当"
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

export const CommonCheckboxList = ({ props: { type, commonDataList }, commonId, setCommonId }: checkboxListProps) => {
  const handleCheckboxChange = (id: number) => {
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
        <h2 className="text-center text-xl font-semibold">
          {type === "player" ? "選手" : type === "umpire" ? "採点者" : type === "course" ? "コース" : null}一覧
        </h2>
      )}
      <div className="w-full">
        <div className="border overflow-x-auto overflow-y-auto max-h-96 sm:h-96 m-3">
          <table className="table table-pin-rows">
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
                  <tr key={common.id} className="hover cursor-pointer" onClick={() => handleCheckboxChange(common.id)} hidden={common.id < 0}>
                    <th>
                      <label>
                        <input
                          type="checkbox"
                          name="selectedCommon"
                          value={common.id}
                          checked={commonId?.includes(common.id) || false}
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
