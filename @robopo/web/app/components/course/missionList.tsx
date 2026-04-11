import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import { Fragment, useEffect, useState } from "react"
import {
  getMissionParameterUnit,
  type MissionState,
  MissionString,
  type MissionValue,
  missionStatePair,
  type PointState,
} from "@/app/components/course/utils"

export function MissionList({
  mission,
  point,
  selectedMissionIndex,
  handleMissionSelect,
  insertPosition,
  setInsertPosition,
}: {
  mission: MissionState
  point: PointState
  selectedMissionIndex: number | null
  handleMissionSelect: (selectedIndex: number) => void
  insertPosition: number
  setInsertPosition: (mode: number) => void
}) {
  const [statePair, setMissionStatePair] = useState<
    { id: string; mission: MissionValue[] }[]
  >([])
  const TOP_INSERT_INDEX = -4 // Special constant for inserting at the top

  useEffect(() => {
    const newStatePair = missionStatePair(mission).map((m) => ({
      id: crypto.randomUUID(),
      mission: m,
    }))
    setMissionStatePair(newStatePair)
  }, [mission])

  // Behavior when radio button is pressed
  // Radio button value >= 0: mission order index
  // Radio button value = -1: no mission set
  // Radio button value = -2: Start
  // Radio button value = -3: Goal

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
              onClick={() => handleMissionSelect(-2)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Space") {
                  handleMissionSelect(-2)
                }
              }}
            >
              <th>
                <input
                  type="radio"
                  name="radio-1"
                  className="radio"
                  value={-2}
                  checked={selectedMissionIndex === -2}
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
                  {/* Show upper button before the first row (index=0) */}
                  {index === 0 && (
                    <>
                      <tr>
                        <th colSpan={4} className="relative h-0 p-0">
                          <AddMissionButton
                            insertPosition={insertPosition}
                            setInsertPosition={setInsertPosition}
                            index={TOP_INSERT_INDEX} // For top insertion only
                            handleMissionSelect={handleMissionSelect}
                          />
                        </th>
                      </tr>
                      {insertPosition === TOP_INSERT_INDEX && (
                        <AddMissionItem
                          selectedMissionIndex={selectedMissionIndex}
                          handleMissionSelect={handleMissionSelect}
                        />
                      )}
                    </>
                  )}
                  <tr
                    className="hover relative cursor-pointer"
                    onClick={() => handleMissionSelect(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Space") {
                        handleMissionSelect(index)
                      }
                    }}
                  >
                    <th>
                      <input
                        type="radio"
                        name="radio-1"
                        className="radio"
                        value={index}
                        checked={selectedMissionIndex === index}
                        readOnly={true}
                      />
                      <AddMissionButton
                        insertPosition={insertPosition}
                        setInsertPosition={setInsertPosition}
                        index={index}
                        handleMissionSelect={handleMissionSelect}
                      />
                    </th>
                    <td>{index + 1}</td>
                    <td>
                      {mission[0] === null ? "-" : MissionString[mission[0]]}
                      {mission[1] === null ? "-" : mission[1]}
                      {getMissionParameterUnit(mission[0])}
                    </td>
                    <td>
                      {Array.isArray(point[index + 2])
                        ? `[${(point[index + 2] as number[]).join(",")}]`
                        : point[index + 2]}
                    </td>
                  </tr>
                  {insertPosition === index && (
                    <AddMissionItem
                      selectedMissionIndex={selectedMissionIndex}
                      handleMissionSelect={handleMissionSelect}
                    />
                  )}
                </Fragment>
              ))
            ) : (
              <AddMissionItem
                selectedMissionIndex={selectedMissionIndex}
                handleMissionSelect={handleMissionSelect}
              />
            )}
            <tr
              className="hover cursor-pointer"
              onClick={() => handleMissionSelect(-3)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Space") {
                  handleMissionSelect(-3)
                }
              }}
            >
              <th>
                <input
                  type="radio"
                  name="radio-1"
                  className="radio"
                  value={-3}
                  checked={selectedMissionIndex === -3}
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
  insertPosition,
  setInsertPosition,
  index,
  handleMissionSelect,
}: {
  insertPosition: number
  setInsertPosition: (mode: number) => void
  index: number
  handleMissionSelect: (index: number) => void
}) => {
  return (
    <button
      type="button"
      className="absolute -bottom-4 -left-4 cursor-pointer rounded-full border bg-white shadow"
      onClick={(e) => {
        e.stopPropagation()
        setInsertPosition(insertPosition === -1 ? index : -1)
        handleMissionSelect(-1) // Select row to add
      }}
    >
      {insertPosition === -1 ? (
        <PlusCircleIcon className="size-5 text-blue-500" />
      ) : (
        insertPosition === index && (
          <MinusCircleIcon className="size-5 text-red-500" />
        )
      )}
    </button>
  )
}

const AddMissionItem = ({
  selectedMissionIndex,
  handleMissionSelect,
}: {
  selectedMissionIndex: number | null
  handleMissionSelect: (index: number) => void
}) => {
  return (
    <tr
      className="hover cursor-pointer"
      onClick={() => handleMissionSelect(-1)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Space") {
          handleMissionSelect(-1)
        }
      }}
    >
      <th>
        <input
          type="radio"
          name="radio-1"
          className="radio"
          value={-1}
          checked={selectedMissionIndex === -1}
          readOnly={true}
        />
      </th>
      <td colSpan={3}>ミッションを追加してください。</td>
    </tr>
  )
}
