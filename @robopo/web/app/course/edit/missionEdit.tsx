import {
  type InsertPreview,
  MissionList,
} from "@/app/components/course/missionList"
import type {
  FieldState,
  MissionState,
  PointState,
} from "@/app/components/course/utils"
import { useCourseEdit } from "@/app/course/edit/courseEditContext"

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
  disabled?: boolean
  courseId?: number | null
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
  disabled = false,
  courseId,
}: MissionEditProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    nameError,
    setNameError,
  } = useCourseEdit()

  async function checkNameDuplicate() {
    const trimmed = name.trim()
    if (trimmed === "") {
      setNameError("")
      return
    }
    const checkedName = trimmed
    const params = new URLSearchParams({ name: checkedName })
    if (courseId) {
      params.set("excludeId", String(courseId))
    }
    try {
      const res = await fetch(`/api/course/check-name?${params}`)
      const data = await res.json()
      if (name.trim() !== checkedName) {
        return
      }
      setNameError(data.exists ? "このコース名は既に使用されています" : "")
    } catch {
      // ignore network errors during validation
    }
  }

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
          />
        </div>
      </div>
      <div className="card mt-3 w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <p className="font-bold text-sm">コースアウト時</p>
          <div className="flex gap-4">
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
          </div>
        </div>
      </div>
      <div className="card mt-3 w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col gap-2">
            <div>
              <input
                type="text"
                placeholder="コース名"
                className={`input input-bordered w-full ${nameError ? "input-error" : ""}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) {
                    setNameError("")
                  }
                }}
                onBlur={checkNameDuplicate}
                disabled={disabled}
              />
              {nameError && (
                <p className="mt-1 text-error text-sm">{nameError}</p>
              )}
            </div>
            <textarea
              placeholder="コースの説明を入力（任意）"
              className="textarea textarea-bordered w-full resize-none"
              rows={1}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
