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
    const value = Number(event.target.value)
    if (Number.isNaN(value)) {
      setSelectedParam(null)
    } else {
      setSelectedParam(value)
    }
  }

  function handlePointChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number(event.target.value)
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

  function addMission(
    selectedId: number,
    selectedMission: MissionValue,
    selectedParam: number,
    selectedPoint: PointValue,
    mission: MissionState,
    point: PointState,
  ) {
    const newMissionState = [...mission]
    const newPointState = [...point]
    if (selectedId === -1) {
      newMissionState[2] = selectedMission
      newMissionState[3] = selectedParam
      newPointState[2] = selectedPoint
    } else {
      const insertIndex = 2 * selectedId + 4
      newMissionState.splice(insertIndex, 0, selectedMission, selectedParam)
      newPointState.splice(selectedId + 3, 0, selectedPoint)
    }
    return { newMissionState, newPointState }
  }

  function updateMission(
    selectedId: number,
    selectedMission: MissionValue,
    selectedParam: number,
    selectedPoint: PointValue,
    mission: MissionState,
    point: PointState,
  ) {
    const newMissionState = [...mission]
    const newPointState = [...point]
    newMissionState[2 * selectedId + 2] = selectedMission
    newMissionState[2 * selectedId + 3] = selectedParam
    newPointState[selectedId + 2] = selectedPoint
    return { newMissionState, newPointState }
  }

  function handleButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    const { id } = event.currentTarget
    if (selectedId === null) {
      return
    }

    let newStates = { newMissionState: [...mission], newPointState: [...point] }

    if (isStartGoal() && id === "update") {
      const newMissionState = [...mission]
      const newPointState = [...point]
      if (selectedId === -2) {
        newMissionState[0] = selectedMission
        newPointState[0] = 0
      } else {
        newMissionState[1] = null
        newPointState[1] = selectedPoint
      }
      newStates = { newMissionState, newPointState }
    } else if (
      id === "add" &&
      selectedMission &&
      selectedParam &&
      selectedPoint
    ) {
      newStates = addMission(
        selectedId,
        selectedMission,
        selectedParam,
        selectedPoint,
        mission,
        point,
      )
    } else if (
      id === "update" &&
      selectedMission &&
      selectedParam &&
      selectedPoint &&
      selectedId !== -1
    ) {
      newStates = updateMission(
        selectedId,
        selectedMission,
        selectedParam,
        selectedPoint,
        mission,
        point,
      )
    } else if (id === "delete" && selectedId !== -1) {
      const newMissionState = [...mission]
      const newPointState = [...point]
      newMissionState.splice(2 * selectedId + 2, 2)
      newPointState.splice(selectedId + 2, 1)
      newStates = { newMissionState, newPointState }
    }

    setMission(newStates.newMissionState)
    setPoint(newStates.newPointState)
    resetUi()
  }

  // Start用セレクト
  function StartSelect({
    selectedMission,
  }: {
    selectedMission: MissionValue | null
    onMissionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  }) {
    return (
      <>
        <p>スタートの向き</p>
        <div className="flex justify-start">
          <select
            className="select select-bordered"
            value={selectedMission ?? ""}
            onChange={handleMissionChange}
          >
            <option value="">選択してください</option>
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
    )
  }

  // Goal用セレクト
  function GoalSelect({
    selectedPoint,
    goalPointArray,
  }: {
    selectedPoint: PointValue | null
    onPointChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    goalPointArray: number[]
  }) {
    return (
      <>
        <p>ゴールポイント</p>
        <div className="flex justify-start">
          <select
            className="select select-bordered ml-2"
            value={selectedPoint ?? ""}
            onChange={handlePointChange}
          >
            <option value="">選択</option>
            {goalPointArray.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <p className="ml-2 self-center">ポイント</p>
        </div>
      </>
    )
  }

  // 通常ミッション用セレクト
  function MissionSelect({
    selectedMission,
    selectedParam,
    selectedPoint,
    onMissionChange,
    onParamChange,
    onPointChange,
    pointArray,
  }: {
    selectedMission: MissionValue | null
    selectedParam: number | null
    selectedPoint: PointValue | null
    onMissionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onParamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    onPointChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    pointArray: number[]
  }) {
    const isMove = selectedMission === "mf" || selectedMission === "mb"
    const isTurn = selectedMission === "tr" || selectedMission === "tl"

    return (
      <>
        <p>ミッション選択</p>
        <div className="flex justify-start">
          <select
            className="select select-bordered"
            value={selectedMission ?? ""}
            onChange={onMissionChange}
          >
            <option value="">選択</option>
            {(["mf", "mb", "tr", "tl"] as Exclude<MissionValue, null>[]).map(
              (v) => (
                <option key={v} value={v}>
                  {MissionString[v]}
                </option>
              ),
            )}
          </select>

          {isMove && (
            <>
              <select
                className="select select-bordered ml-2"
                value={selectedParam ?? ""}
                onChange={onParamChange}
              >
                <option value="">選択</option>
                {[1, 2].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <p className="ml-2 self-center">パネル</p>
            </>
          )}

          {isTurn && (
            <>
              <select
                className="select select-bordered ml-2"
                value={selectedParam ?? ""}
                onChange={onParamChange}
              >
                <option value="">選択</option>
                {[90, 180, 270, 360].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <p className="ml-2 self-center">度</p>
            </>
          )}

          {(isMove || isTurn) && (
            <>
              <select
                className="select select-bordered ml-2"
                value={selectedPoint ?? ""}
                onChange={onPointChange}
              >
                <option value="">選択</option>
                {pointArray.map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <p className="ml-2 self-center">ポイント</p>
            </>
          )}

          {!isMove && !isTurn && (
            <p className="self-center">{"<"}-選択してください</p>
          )}
        </div>
      </>
    )
  }

  const pointArray = [0, 1, 2]
  const goalPointArray = [5, 10]

  return (
    <div>
      <div>MissionUI</div>
      <div className="container">
        {selectedId === -2 ? (
          <StartSelect
            selectedMission={selectedMission}
            onMissionChange={handleMissionChange}
          />
        ) : selectedId === -3 ? (
          <GoalSelect
            selectedPoint={selectedPoint}
            onPointChange={handlePointChange}
            goalPointArray={goalPointArray}
          />
        ) : selectedId === null ? (
          <p>上のいずれかを選択してください</p>
        ) : (
          <MissionSelect
            selectedMission={selectedMission}
            selectedParam={selectedParam}
            selectedPoint={selectedPoint}
            onMissionChange={handleMissionChange}
            onParamChange={handleParamChange}
            onPointChange={handlePointChange}
            pointArray={pointArray}
          />
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
            (selectedId !== -2 && selectedPoint == null) ||
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
