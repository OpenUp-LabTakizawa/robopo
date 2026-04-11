import {
  type InsertPreview,
  MissionList,
} from "@/app/components/course/missionList"
import type {
  FieldState,
  MissionState,
  PointState,
} from "@/app/components/course/utils"

type MissionEditProps = {
  field: FieldState
  mission: MissionState
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  point: PointState
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
  selectedMissionIndex: number | null
  setSelectedMissionIndex: (index: number | null) => void
  undoMission: () => void
  redoMission: () => void
  canUndoMission: boolean
  canRedoMission: boolean
  pushMissionHistory: () => void
  missionPanelHints: (number | null)[]
  setMissionPanelHints: React.Dispatch<React.SetStateAction<(number | null)[]>>
  onInsertPreview?: (preview: InsertPreview | null) => void
}

export default function MissionEdit({
  field,
  mission,
  setMission,
  point,
  setPoint,
  selectedMissionIndex,
  setSelectedMissionIndex,
  undoMission,
  redoMission,
  canUndoMission,
  canRedoMission,
  pushMissionHistory,
  missionPanelHints,
  setMissionPanelHints,
  onInsertPreview,
}: MissionEditProps) {
  return (
    <div className="container mx-auto">
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <MissionList
            field={field}
            mission={mission}
            setMission={setMission}
            point={point}
            setPoint={setPoint}
            selectedMissionIndex={selectedMissionIndex}
            setSelectedMissionIndex={setSelectedMissionIndex}
            undoMission={undoMission}
            redoMission={redoMission}
            canUndoMission={canUndoMission}
            canRedoMission={canRedoMission}
            pushMissionHistory={pushMissionHistory}
            missionPanelHints={missionPanelHints}
            setMissionPanelHints={setMissionPanelHints}
            onInsertPreview={onInsertPreview}
          />
        </div>
      </div>
    </div>
  )
}
