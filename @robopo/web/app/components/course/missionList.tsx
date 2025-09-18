import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import { Fragment, useEffect, useState } from "react"
import {
  type MissionState,
  MissionString,
  type MissionValue,
  missionStatePair,
  type PointState,
  panelOrDegree,
} from "@/app/components/course/utils"

export function MissionList({
  mission,
  point,
  radio,
  handleRadioChange,
  addOrder,
  setAddOrder,
}: {
  mission: MissionState
  point: PointState
  radio: number | null
  handleRadioChange: (selectedIndex: number) => void
  addOrder: number
  setAddOrder: (mode: number) => void
}) {
  const [statePair, setMissionStatePair] = useState<
    { id: string; mission: MissionValue[] }[]
  >([])
  const TOP_INSERT_INDEX = -4 // 先頭に挿入するための特別な定数

  useEffect(() => {
    const newStatePair = missionStatePair(mission).map((m) => ({
      id: crypto.randomUUID(),
      mission: m,
    }))
    setMissionStatePair(newStatePair)
  }, [mission])

  // ラジオボタンを押した時の動作
  // ラジオボタン value=0以上の整数 はmissionの順番
  // ラジオボタン value=-1 はmissionが設定されていない
  // ラジオボタン value=-2 はStart
  // ラジオボタン value=-3 はGoal

  return (
    <div className="max-h-64 w-full overflow-auto p-4">
      <div>MissionEdit</div>
      <div className="form-control">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="radio"
                  name="radio-1"
                  className="radio"
                  disabled={true}
                />
              </th>
              <th>順番</th>
              <th>ミッション</th>
              <th>ポイント</th>
            </tr>
          </thead>
          <tbody>
            <tr
              className="hover relative cursor-pointer"
              onClick={() => handleRadioChange(-2)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Space") {
                  handleRadioChange(-2)
                }
              }}
            >
              <th>
                <input
                  type="radio"
                  name="radio-1"
                  className="radio"
                  value={-2}
                  checked={radio === -2}
                  readOnly={true}
                />
              </th>
              <td>Start</td>
              {mission[0] === null ||
              mission[0] === undefined ||
              mission[0] === "" ? (
                <td>-</td>
              ) : (
                <td>{MissionString[mission[0]]}</td>
              )}
              <td>{point[0]}</td>
            </tr>
            {statePair.length > 0 ? (
              statePair.map(({ id, mission }, index) => (
                <Fragment key={id}>
                  {/* 先頭行(index=0)の前に上側ボタンを表示 */}
                  {index === 0 && (
                    <>
                      <tr>
                        <th colSpan={4} className="relative h-0 p-0">
                          <AddMissionButton
                            addOrder={addOrder}
                            setAddOrder={setAddOrder}
                            index={TOP_INSERT_INDEX} // 上側挿入専用
                            handleRadioChange={handleRadioChange}
                          />
                        </th>
                      </tr>
                      {addOrder === TOP_INSERT_INDEX && (
                        <AddMissionItem
                          radio={radio}
                          handleRadioChange={handleRadioChange}
                        />
                      )}
                    </>
                  )}
                  <tr
                    className="hover relative cursor-pointer"
                    onClick={() => handleRadioChange(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Space") {
                        handleRadioChange(index)
                      }
                    }}
                  >
                    <th>
                      <input
                        type="radio"
                        name="radio-1"
                        className="radio"
                        value={index}
                        checked={radio === index}
                        readOnly={true}
                      />
                      <AddMissionButton
                        addOrder={addOrder}
                        setAddOrder={setAddOrder}
                        index={index}
                        handleRadioChange={handleRadioChange}
                      />
                    </th>
                    <td>{index + 1}</td>
                    <td>
                      {mission[0] === null ? "-" : MissionString[mission[0]]}
                      {mission[1] === null ? "-" : mission[1]}
                      {panelOrDegree(mission[0])}
                    </td>
                    <td>{point[index + 2]}</td>
                  </tr>
                  {addOrder === index && (
                    <AddMissionItem
                      radio={radio}
                      handleRadioChange={handleRadioChange}
                    />
                  )}
                </Fragment>
              ))
            ) : (
              <AddMissionItem
                radio={radio}
                handleRadioChange={handleRadioChange}
              />
            )}
            <tr
              className="hover cursor-pointer"
              onClick={() => handleRadioChange(-3)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Space") {
                  handleRadioChange(-3)
                }
              }}
            >
              <th>
                <input
                  type="radio"
                  name="radio-1"
                  className="radio"
                  value={-3}
                  checked={radio === -3}
                  readOnly={true}
                />
              </th>
              <td>Goal</td>
              {mission[1] === null ||
              mission[1] === undefined ||
              mission[1] === "" ? (
                <td>-</td>
              ) : (
                <td>{MissionString[mission[1]]}</td>
              )}
              <td>{point[1]}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div />
    </div>
  )
}

const AddMissionButton = ({
  addOrder,
  setAddOrder,
  index,
  handleRadioChange,
}: {
  addOrder: number
  setAddOrder: (mode: number) => void
  index: number
  handleRadioChange: (index: number) => void
}) => {
  return (
    <button
      type="button"
      className="-bottom-4 -left-4 absolute cursor-pointer rounded-full border bg-white shadow"
      onClick={(e) => {
        e.stopPropagation()
        setAddOrder(addOrder === -1 ? index : -1)
        handleRadioChange(-1) // 追加する行を選択
        console.log("addOrder", addOrder)
      }}
    >
      {addOrder === -1 ? (
        <PlusCircleIcon className="size-5 text-blue-500" />
      ) : (
        addOrder === index && (
          <MinusCircleIcon className="size-5 text-red-500" />
        )
      )}
    </button>
  )
}

const AddMissionItem = ({
  radio,
  handleRadioChange,
}: {
  radio: number | null
  handleRadioChange: (index: number) => void
}) => {
  return (
    <tr
      className="hover cursor-pointer"
      onClick={() => handleRadioChange(-1)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Space") {
          handleRadioChange(-1)
        }
      }}
    >
      <th>
        <input
          type="radio"
          name="radio-1"
          className="radio"
          value={-1}
          checked={radio === -1}
          readOnly={true}
        />
      </th>
      <td colSpan={3}>ミッションを追加してください。</td>
    </tr>
  )
}
