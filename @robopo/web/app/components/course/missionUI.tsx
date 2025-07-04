import type React from "react"
import { useState } from "react"
import {
  type MissionState,
  MissionString,
  type MissionValue,
  type PointState,
  type PointValue,
} from "@/app/components/course/utils"

// 総じて同じようなプルダウンメニューが複数あるのでrefactoringの必要がある。

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
  setRadio,
}: {
  mission: MissionState
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  point: PointState
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
  selectedId: number | null
  setRadio: React.Dispatch<React.SetStateAction<number | null>>
}) {
  const [isMove, setIsMove] = useState<boolean>(false)
  const [isTurn, setIsTurn] = useState<boolean>(false)
  const [selectedMission, setSelectedMission] = useState<MissionValue | null>(
    null,
  ) // 選択されたミッション
  const [selectedParam, setSelectedParam] = useState<number | null>(null) // 選択されたミッションのパラメータ
  const [selectedPoint, setSelectedPoint] = useState<PointValue | null>(null)

  function handleMissionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    // 「選択」に変更された場合、MissionもParamもnullにして入れられないようにする。
    // 「選択」をdisabledにすれば良いやんと思うかもしれないが、
    // リストでラジオボタンを切り替えた時の動作に不満があるので、
    // ここでhandleする。
    if (event.target.value === "0") {
      setSelectedMission(null)
      setSelectedParam(null)
      setSelectedPoint(null)
    }
    const value = event.target.value as MissionValue

    setSelectedMission(value)
    if (value === "mf" || value === "mb") {
      setIsMove(true)
      setIsTurn(false)
    } else if (value === "tr" || value === "tl") {
      setIsTurn(true)
      setIsMove(false)
    } else {
      setIsMove(false)
      setIsTurn(false)
    }
  }

  function handleParamChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number.parseInt(event.target.value)
    if (value === 0) {
      setSelectedParam(null)
    } else {
      setSelectedParam(value)
    }
  }

  function handlePointChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = Number.parseInt(event.target.value)
    setSelectedPoint(value)
  }

  // UIをリセットする関数
  function resetUi() {
    setIsMove(false)
    setIsTurn(false)
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
        // start時point選択機能が必要になれば付ける。
        // newPointState[0] = selectedPoint
      } else {
        // Goalで更新ボタン押下時
        newMissionState[1] = null
        // goal時向き自動で決まるので、設定しないことにする。
        // newMissionState[1] = selectedMission
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
            <label className="label">スタートの向き</label>
            <div className="flex justify-start">
              <select
                className="select select-bordered"
                defaultValue={0}
                onChange={handleMissionChange}
              >
                {/* ここでdisabledにしておくとmissionListでラジオボタン切り替えた際にdefaultが選択してくださいにならないのが気に食わないので、disabledにしない */}
                <option disabled={true} value={0}>
                  選択してください
                </option>
                {(["u", "r", "d", "l"] as Exclude<MissionValue, null>[]).map(
                  (value) => (
                    <option key={value} value={value}>
                      {MissionString[value]}
                    </option>
                  ),
                )}
              </select>
              {/* start時point選択機能が必要になれば付ける */}
              {/* {selectedMission !== null ? (
                      <>
                        <select
                          className="select select-bordered ml-2"
                          defaultValue={0}
                          onChange={handlePointChange}
                          >
                          <option disabled value={0}>
                            選択
                          </option>
                          {[0, 1, 2, 3, 4, 5].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                        <p className="self-center ml-2">
                          ポイント
                        </p>
                      </>
                    ) : null} */}
            </div>
          </>
        ) : selectedId === -3 ? (
          <>
            <label className="label">ゴールポイント</label>
            <div className="flex justify-start">
              <select
                className="select select-bordered ml-2"
                defaultValue={0}
                onChange={handlePointChange}
              >
                {/* ここでdisabledにしておくとmissionListでラジオボタン切り替えた際にdefaultが選択してくださいにならないのが気に食わないので、disabledにしない */}
                <option disabled={true} value={undefined}>
                  選択
                </option>
                {goalPointArray.map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <p className="self-center ml-2">ポイント</p>
            </div>
          </>
        ) : selectedId === null ? (
          <label className="label">上のいずれかを選択してください</label>
        ) : (
          <>
            <label className="label">ミッション選択</label>
            <div className="flex justify-start">
              <select
                className="select select-bordered"
                defaultValue={0}
                onChange={handleMissionChange}
              >
                {/* ここでdisabledにしておくとmissionListでラジオボタン切り替えた際にdefaultが選択にならないのが気に食わないので、disabledにしない */}
                <option value={0}>選択</option>
                {(
                  ["mf", "mb", "tr", "tl"] as Exclude<MissionValue, null>[]
                ).map((value) => (
                  <option key={value} value={value}>
                    {MissionString[value]}
                  </option>
                ))}
              </select>
              {isMove ? (
                <>
                  <select
                    className="select select-bordered ml-2"
                    defaultValue={0}
                    onChange={handleParamChange}
                  >
                    <option value={0}>選択</option>
                    {[1, 2].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="self-center ml-2">パネル</p>
                  <select
                    className="select select-bordered ml-2"
                    defaultValue={0}
                    onChange={handlePointChange}
                  >
                    <option value={0}>選択</option>
                    {pointArray.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="self-center ml-2">ポイント</p>{" "}
                </>
              ) : isTurn ? (
                <>
                  <select
                    className="select select-bordered ml-2"
                    defaultValue={0}
                    onChange={handleParamChange}
                  >
                    <option disabled={true} value={0}>
                      選択
                    </option>
                    {[90, 180, 270, 360].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="self-center ml-2">度</p>
                  <select
                    className="select select-bordered"
                    defaultValue={0}
                    onChange={handlePointChange}
                  >
                    <option disabled={true} value={0}>
                      選択
                    </option>
                    {pointArray.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="self-center ml-2">ポイント</p>
                </>
              ) : (
                <p className="self-center">{"<"}-選択してください</p>
              )}
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-4 mt-2">
        <div />
        <button
          type="button"
          id="add"
          className="btn btn-primary mx-auto"
          disabled={isStartGoal() || selectedId === null}
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
            (selectedId === -2 && selectedMission === null) ||
            (selectedId === -3 && selectedPoint === null)
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
