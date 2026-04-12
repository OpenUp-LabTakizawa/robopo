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
  courseOutRule: string
  setCourseOutRule: React.Dispatch<React.SetStateAction<string>>
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
  invalidMissionMap?: Map<number, string>
  isPlaying?: boolean
  onTogglePlay?: () => void
  canPlay?: boolean
}

export default function MissionEdit({
  field,
  mission,
  setMission,
  point,
  setPoint,
  courseOutRule,
  setCourseOutRule,
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
  invalidMissionMap,
  isPlaying,
  onTogglePlay,
  canPlay,
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
            invalidMissionMap={invalidMissionMap}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            canPlay={canPlay}
          />
        </div>
      </div>
      <div className="card mt-3 w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <p className="font-bold text-sm">コースアウト時</p>
          <div className="flex flex-wrap gap-4">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="courseOutRule"
                className="radio radio-sm radio-primary"
                value="keep"
                checked={courseOutRule === "keep"}
                onChange={(e) => setCourseOutRule(e.target.value)}
              />
              <span className="label-text">獲得済ポイント維持</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="courseOutRule"
                className="radio radio-sm radio-primary"
                value="zero"
                checked={courseOutRule === "zero"}
                onChange={(e) => setCourseOutRule(e.target.value)}
              />
              <span className="label-text">0点</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="courseOutRule"
                className="radio radio-sm radio-primary"
                checked={courseOutRule.startsWith("penalty:")}
                onChange={() => {
                  if (!courseOutRule.startsWith("penalty:")) {
                    setCourseOutRule("penalty:0")
                  }
                }}
              />
              <span className="label-text">減点</span>
            </label>
          </div>
          {courseOutRule.startsWith("penalty:") && (
            <div className="mt-2 flex items-center gap-1">
              <span className="font-bold text-error text-sm">-</span>
              <input
                type="number"
                min="0"
                step="1"
                className="input input-bordered input-sm w-20"
                value={Number.parseInt(courseOutRule.split(":")[1], 10) || 0}
                onChange={(e) => {
                  const val = Math.max(
                    0,
                    Math.floor(Number(e.target.value) || 0),
                  )
                  setCourseOutRule(`penalty:${val}`)
                }}
              />
              <span className="text-sm">pt</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
