import { useState } from "react"
import { MissionList } from "@/app/components/course/missionList"
import { MissionUI } from "@/app/components/course/missionUI"
import type {
  MissionState,
  MissionValue,
  PointState,
  PointValue,
} from "@/app/components/course/utils"

type MissionEditProps = {
  mission: MissionState
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  point: PointState
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
}

export default function MissionEdit({
  mission,
  setMission,
  point,
  setPoint,
}: MissionEditProps) {
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<
    number | null
  >(null)
  const [selectedMission, setSelectedMission] = useState<MissionValue | null>(
    null,
  )
  const [selectedParam, setSelectedParam] = useState<number | null>(null) // 選択されたミッションのパラメータ
  const [selectedPoint, setSelectedPoint] = useState<PointValue | null>(null)
  const [insertPosition, setInsertPosition] = useState<number>(-1)

  function handleMissionSelect(selectedIndex: number) {
    setSelectedMissionIndex(selectedIndex) // Save selected index as state
    setSelectedMission(null) // Reset selected mission
    setSelectedParam(null) // Reset selected parameter
    setSelectedPoint(null) // Reset selected point
  }
  // Behavior when radio button is pressed
  // Radio button value >= 0: mission order index
  // Radio button value = -1: no mission set
  // Radio button value = -2: Start
  // Radio button value = -3: Goal

  return (
    <div className="container mx-auto">
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <MissionList
            mission={mission}
            point={point}
            selectedMissionIndex={selectedMissionIndex}
            handleMissionSelect={handleMissionSelect}
            insertPosition={insertPosition}
            setInsertPosition={setInsertPosition}
          />
        </div>
      </div>
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <MissionUI
            mission={mission}
            setMission={setMission}
            point={point}
            selectedMissionIndex={selectedMissionIndex}
            setPoint={setPoint}
            selectedId={
              selectedMissionIndex === -1
                ? insertPosition
                : selectedMissionIndex
            }
            selectedMission={selectedMission}
            setSelectedMission={setSelectedMission}
            selectedParam={selectedParam}
            setSelectedParam={setSelectedParam}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            setSelectedMissionIndex={setSelectedMissionIndex}
            setInsertPosition={setInsertPosition}
          />
        </div>
      </div>
    </div>
  )
}
