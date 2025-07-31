import type React from "react"
import {
  type MissionState,
  MissionString,
  type MissionValue,
  type PointState,
  type PointValue,
} from "@/app/components/course/utils"

// ラジオボタン value=0以上の整数 はmissionの順番
// ラジオボタン value=-1 はmissionが設定されていない
// ラジオボタン value=-2 はStart
// ラジオボタン value=-3 はGoal

export function MissionUI({
  mission,
  setMission,
  point,
  setPoint,
  selectedId,
  selectedMission,
  setSelectedMission,
  selectedParam,
  setSelectedParam,
  selectedPoint,
  setSelectedPoint,
  setRadio,
}: {
  mission: MissionState
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  point: PointState
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
  selectedId: number | null
  selectedMission: MissionValue | null
  setSelectedMission: React.Dispatch<React.SetStateAction<MissionValue | null>>
  selectedParam: number | null
  setSelectedParam: React.Dispatch<React.SetStateAction<number | null>>
  selectedPoint: PointValue | null
  setSelectedPoint: React.Dispatch<React.SetStateAction<PointValue | null>>
  setRadio: React.Dispatch<React.SetStateAction<number | null>>
}) {
  function handleMissionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // 「選択」に変更された場合、MissionもParamもnullにして入れられないようにする。
    // 「選択」をdisabledにすれば良いやんと思うかもしれないが、
    // リストでラジオボタンを切り替えた時の動作に不満があるので、
    // ここでhandleする。
    if (event.target.value === "") {
      setSelectedMission(null)
      setSelectedParam(null)
      setSelectedPoint(null)
    } else {
      setSelectedMission(event.target.value as MissionValue)
    }
  }

  function handleParamChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number.parseInt(event.target.value)
    if (Number.isNaN(value)) {
      setSelectedParam(null)
    } else {
      setSelectedParam(value)
    }
  }

  function handlePointChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number.parseInt(event.target.value)
    if (Number.isNaN(value)) {
      setSelectedPoint(null)
    } else {
      setSelectedPoint(value as PointValue)
    }
  }

  // UIをリセットする関数
  function resetUi() {
    setSelectedMission(null)
    setSelectedParam(null)
    setSelectedPoint(null)
    setRadio(null)
  }

  // start, goalを選択しているかをチェックする関数
  function isStartGoal() {
    if (selectedId === -2 || selectedId === -3) {
      return true
    }
    return false
  }

  function handleButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    const id = event.currentTarget.id

    if (selectedId === null) {
      return
    }
    const newMissionState = [...mission]
    const newPointState = [...point]

    if (isStartGoal() && id === "update") {
      if (selectedId === -2) {
        // Startで更新ボタン押下時
        newMissionState[0] = selectedMission
        newPointState[0] = 0
      } else {
        // Goalで更新ボタン押下時
        newMissionState[1] = null
        newPointState[1] = selectedPoint
      }
    } else if (
      id === "add" &&
      selectedMission !== null &&
      selectedParam !== null &&
      selectedPoint !== null
    ) {
      // 追加ボタン押下時
      if (selectedId === -1) {
        // ミッションに何も入っていない時
        newMissionState[2] = selectedMission
        newMissionState[3] = selectedParam
        newPointState[2] = selectedPoint
      } else {
        const insertIndex = 2 * selectedId + 4
        newMissionState.splice(insertIndex, 0, selectedMission, selectedParam)
        newPointState.splice(selectedId + 3, 0, selectedPoint)
      }
    } else if (
      id === "update" &&
      !isStartGoal() &&
      selectedMission !== null &&
      selectedParam !== null &&
      selectedPoint !== null &&
      selectedId !== -1
    ) {
      // 更新ボタン押下時
      newMissionState[2 * selectedId + 2] = selectedMission
      newMissionState[2 * selectedId + 3] = selectedParam
      newPointState[selectedId + 2] = selectedPoint
    } else if (id === "delete" && selectedId !== -1) {
      // 削除ボタン押下時
      newMissionState.splice(2 * selectedId + 2, 2)
      newPointState.splice(selectedId + 2, 1)
    }
    setMission(newMissionState)
    setPoint(newPointState)
    resetUi()
  }

  const pointArray = [0, 1, 2]
  const goalPointArray = [5, 10]

  return (
    <div>
      <div>MissionUI</div>
      <div className="container">
        {selectedId === -2 ? (
          <>
            <p>スタートの向き</p>
            <div className="flex justify-start">
              <select
                className="select select-bordered"
                value={selectedMission ?? ""}
                onChange={handleMissionChange}
              >
                <option value={""}>選択してください</option>
                {(["u", "r", "d", "l"] as Exclude<MissionValue, null>[]).map(
                  (value) => (
                    <option key={value} value={value}>
                      {MissionString[value]}
                    </option>
                  ),
                )}
              </select>
            </div>
          </>
        ) : selectedId === -3 ? (
          <>
            <p>ゴールポイント</p>
            <div className="flex justify-start">
              <select
                className="select select-bordered ml-2"
                value={selectedPoint ?? ""}
                onChange={handlePointChange}
              >
                <option value={""}>選択</option>
                {goalPointArray.map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <p className="ml-2 self-center">ポイント</p>
            </div>
          </>
        ) : selectedId === null ? (
          <p>上のいずれかを選択してください</p>
        ) : (
          <>
            <p>ミッション選択</p>
            <div className="flex justify-start">
              <select
                className="select select-bordered"
                value={selectedMission ?? ""}
                onChange={handleMissionChange}
              >
                <option value={""}>選択</option>
                {(
                  ["mf", "mb", "tr", "tl"] as Exclude<MissionValue, null>[]
                ).map((value) => (
                  <option key={value} value={value}>
                    {MissionString[value]}
                  </option>
                ))}
              </select>
              {selectedMission === "mf" || selectedMission === "mb" ? (
                <>
                  <select
                    className="select select-bordered ml-2"
                    value={selectedParam ?? ""}
                    onChange={handleParamChange}
                  >
                    <option value={""}>選択</option>
                    {[1, 2].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="ml-2 self-center">パネル</p>
                </>
              ) : selectedMission === "tr" || selectedMission === "tl" ? (
                <>
                  <select
                    className="select select-bordered ml-2"
                    value={selectedParam ?? ""}
                    onChange={handleParamChange}
                  >
                    <option value={""}>選択</option>
                    {[90, 180, 270, 360].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="ml-2 self-center">度</p>
                </>
              ) : (
                <p className="self-center">{"<"}-選択してください</p>
              )}
              {selectedMission !== null && (
                <>
                  <select
                    className="select select-bordered"
                    value={selectedPoint ?? ""}
                    onChange={handlePointChange}
                  >
                    <option value={""}>選択</option>
                    {pointArray.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="ml-2 self-center">ポイント</p>
                </>
              )}
            </div>
          </>
        )}
      </div>
      <div className="mt-2 grid grid-cols-4">
        <div />
        <button
          type="button"
          id="add"
          className="btn btn-primary mx-auto"
          disabled={
            isStartGoal() ||
            selectedId === null ||
            selectedMission === null ||
            selectedParam === null ||
            Number.isNaN(selectedPoint) ||
            selectedPoint == null
          }
          onClick={handleButtonClick}
        >
          追加
        </button>
        <button
          type="button"
          id="update"
          className="btn btn-primary mx-auto"
          onClick={handleButtonClick}
          disabled={
            selectedId === null ||
            selectedId === -1 ||
            (selectedId !== -2 &&
              selectedId !== -3 &&
              selectedParam === null) ||
            (selectedId !== -2 && (Number.isNaN(selectedPoint) || selectedPoint == null)) ||
            (selectedId !== -3 && selectedMission === null)
          }
        >
          更新
        </button>
        <button
          type="button"
          id="delete"
          className="btn btn-warning mx-auto"
          onClick={handleButtonClick}
          disabled={isStartGoal() || selectedId === null}
        >
          削除
        </button>
      </div>
    </div>
  )
}
