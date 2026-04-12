import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { PlayIcon, StopIcon } from "@heroicons/react/24/solid"
import { useEffect, useRef, useState } from "react"
import {
  type FieldState,
  findGoal,
  findStart,
  getMissionParameterUnit,
  getRobotPosition,
  MAX_FIELD_WIDTH,
  type MissionState,
  MissionString,
  type MissionValue,
  missionStatePair,
  type PointEntry,
  type PointState,
} from "@/app/components/course/utils"

// ─── Types ───────────────────────────────────────────────────────────

export type InsertPreview = {
  afterIndex: number
  missionType: MissionValue
  param: number
}

export function buildPreviewMission(
  baseMission: MissionState,
  { afterIndex, missionType, param }: InsertPreview,
): { missionWithInsert: MissionState; selectedIndex: number } {
  const temp = [...baseMission]
  if (temp.length <= 2) {
    while (temp.length < 4) {
      temp.push(null)
    }
    temp[2] = missionType
    temp[3] = param
    return { missionWithInsert: temp, selectedIndex: 0 }
  }
  const insertIndex = 2 + (afterIndex + 1) * 2
  temp.splice(insertIndex, 0, missionType, param)
  return { missionWithInsert: temp, selectedIndex: afterIndex + 1 }
}

type MissionPairItem = {
  id: string
  index: number
  mission: MissionValue[]
}

// ─── Main Component ──────────────────────────────────────────────────

export function MissionList({
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
  invalidMissionMap,
  isPlaying = false,
  onTogglePlay,
  canPlay = false,
}: {
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
  invalidMissionMap?: Map<number, string>
  isPlaying?: boolean
  onTogglePlay?: () => void
  canPlay?: boolean
}) {
  const [items, setItems] = useState<MissionPairItem[]>([])
  const [insertingAt, setInsertingAt] = useState<number | null>(null)

  // Build sortable items from mission state
  useEffect(() => {
    const pairs = missionStatePair(mission)
    setItems(
      pairs.map((m, i) => ({
        id: `mission-${i}-${m[0]}-${m[1]}`,
        index: i,
        mission: m,
      })),
    )
  }, [mission])

  // Compute panel positions for each mission
  const panelPositions = (() => {
    const start = findStart(field)
    if (!start) {
      return null
    }
    const [startRow, startCol] = start
    const pairs = missionStatePair(mission)
    const positions: number[] = []
    for (let i = 0; i <= pairs.length; i++) {
      const [row, col] = getRobotPosition(startRow, startCol, mission, i)
      positions.push(row * MAX_FIELD_WIDTH + col + 1)
    }
    // Goal panel number comes from actual field position, not robot position
    const goal = findGoal(field)
    const goalPanel = goal ? goal[0] * MAX_FIELD_WIDTH + goal[1] + 1 : undefined
    return {
      startPanel: startRow * MAX_FIELD_WIDTH + startCol + 1,
      positions,
      goalPanel,
    }
  })()

  // ─── DnD ─────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    pushMissionHistory()

    // Reorder mission pairs in the flat array
    const newMission = [...mission]
    const newPoint = [...point]

    // Extract the pair being moved
    const missionPairStart = 2 + oldIndex * 2
    const movedMission = newMission.splice(missionPairStart, 2)
    const movedPoint = newPoint.splice(oldIndex + 2, 1)

    // Insert at new position
    const insertMissionAt = 2 + newIndex * 2
    newMission.splice(insertMissionAt, 0, ...movedMission)
    newPoint.splice(newIndex + 2, 0, ...movedPoint)

    setMission(newMission)
    setPoint(newPoint)
    setSelectedMissionIndex(newIndex)

    // Reorder panel hints
    setMissionPanelHints((prev) => {
      const newHints = [...prev]
      const [movedHint] = newHints.splice(oldIndex, 1)
      newHints.splice(newIndex, 0, movedHint ?? null)
      return newHints
    })
  }

  // ─── Mission CRUD ────────────────────────────────────────

  function handleAddMission(afterIndex: number) {
    setInsertingAt(afterIndex)
    setSelectedMissionIndex(-1)
    onInsertPreview?.(null)
  }

  function handleInsertMission(
    missionType: MissionValue,
    param: number,
    pointEntry: PointEntry,
    panelHint: number | null,
  ) {
    if (insertingAt === null) {
      return
    }
    pushMissionHistory()

    const { missionWithInsert, selectedIndex } = buildPreviewMission(mission, {
      afterIndex: insertingAt,
      missionType,
      param,
    })

    // Insert point entry at the corresponding position
    const newPoint = [...point]
    if (mission.length <= 2) {
      while (newPoint.length < 3) {
        newPoint.push(0)
      }
      newPoint[2] = pointEntry
    } else {
      newPoint.splice(insertingAt + 3, 0, pointEntry)
    }

    setMission(missionWithInsert)
    setPoint(newPoint)
    setInsertingAt(null)
    setSelectedMissionIndex(selectedIndex)
    onInsertPreview?.(null)
    // Insert panel hint at the new position
    if (insertingAt !== null) {
      setMissionPanelHints((prev) => {
        const newHints = [...prev]
        newHints.splice(insertingAt + 1, 0, panelHint)
        return newHints
      })
    }
  }

  function handleDeleteMission(index: number) {
    pushMissionHistory()
    const newMission = [...mission]
    const newPoint = [...point]
    newMission.splice(2 + index * 2, 2)
    newPoint.splice(index + 2, 1)
    setMission(newMission)
    setPoint(newPoint)
    setSelectedMissionIndex(null)
    setMissionPanelHints((prev) => {
      const newHints = [...prev]
      newHints.splice(index, 1)
      return newHints
    })
  }

  function handleUpdateMission(
    index: number,
    missionType: MissionValue,
    param: MissionValue,
    pointEntry: PointEntry,
  ) {
    pushMissionHistory()
    const newMission = [...mission]
    const newPoint = [...point]
    newMission[2 + index * 2] = missionType
    newMission[2 + index * 2 + 1] = param
    newPoint[index + 2] = pointEntry
    setMission(newMission)
    setPoint(newPoint)
    // Clear hint when mission type is set (computed position takes over)
    if (missionType !== null) {
      setMissionPanelHints((prev) => {
        const newHints = [...prev]
        newHints[index] = null
        return newHints
      })
    }
  }

  function handleUpdateStart(dir: MissionValue) {
    pushMissionHistory()
    const newMission = [...mission]
    newMission[0] = dir
    setMission(newMission)
  }

  function handleUpdateGoalPoint(p: PointEntry) {
    pushMissionHistory()
    const newPoint = [...point]
    newPoint[1] = p
    setPoint(newPoint)
  }

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Header with Total Points & Undo/Redo */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-sm">ミッション</h3>
        <span className="badge badge-sm font-mono">
          合計{" "}
          {point.slice(1).reduce<number>((sum, entry) => {
            if (entry === null) {
              return sum
            }
            if (Array.isArray(entry)) {
              return sum + Math.max(...entry)
            }
            return sum + entry
          }, 0)}{" "}
          pt
        </span>
        <div className="flex gap-1">
          {onTogglePlay && (
            <div
              className="tooltip tooltip-bottom"
              data-tip={isPlaying ? "停止" : "全体プレビュー"}
            >
              <button
                type="button"
                className={`btn btn-xs ${
                  isPlaying
                    ? "btn-error text-white"
                    : "bg-gradient-to-r from-primary to-secondary text-white shadow-sm hover:shadow-md"
                } transition-all duration-200`}
                onClick={onTogglePlay}
                disabled={!canPlay && !isPlaying}
              >
                {isPlaying ? (
                  <StopIcon className="size-3.5" />
                ) : (
                  <PlayIcon className="size-3.5" />
                )}
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={undoMission}
            disabled={!canUndoMission || isPlaying}
            title="元に戻す"
          >
            <ArrowUturnLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={redoMission}
            disabled={!canRedoMission || isPlaying}
            title="やり直す"
          >
            <ArrowUturnRightIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="space-y-0">
        {/* Start Row */}
        <StartRow
          mission={mission}
          panelNumber={panelPositions?.startPanel}
          isSelected={selectedMissionIndex === -2}
          onSelect={() => setSelectedMissionIndex(-2)}
          onUpdateDirection={handleUpdateStart}
        />

        {/* Add button before first mission */}
        <AddButton
          onClick={() => handleAddMission(-1)}
          isActive={insertingAt === -1}
        />
        {insertingAt === -1 && (
          <InsertMissionRow
            defaultPanelId={panelPositions?.startPanel ?? null}
            onInsert={handleInsertMission}
            onCancel={() => {
              setInsertingAt(null)
              onInsertPreview?.(null)
            }}
            onPreviewChange={(mt, p) =>
              onInsertPreview?.({ afterIndex: -1, missionType: mt, param: p })
            }
            onPreviewClear={() => onInsertPreview?.(null)}
          />
        )}

        {/* Sortable mission items */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, idx) => (
              <div key={item.id}>
                <SortableMissionRow
                  item={item}
                  index={idx}
                  panelNumber={
                    item.mission[0] === null && missionPanelHints[idx]
                      ? missionPanelHints[idx]
                      : panelPositions?.positions[idx]
                  }
                  point={point[idx + 2]}
                  isSelected={selectedMissionIndex === idx}
                  isInvalid={invalidMissionMap?.has(idx) ?? false}
                  invalidReason={invalidMissionMap?.get(idx)}
                  isPlaying={isPlaying}
                  onSelect={() => setSelectedMissionIndex(idx)}
                  onDelete={() => handleDeleteMission(idx)}
                  onUpdate={(mt, p, pt) => handleUpdateMission(idx, mt, p, pt)}
                  onPanelChange={(num) => {
                    setMissionPanelHints((prev) => {
                      const newHints = [...prev]
                      while (newHints.length <= idx) {
                        newHints.push(null)
                      }
                      newHints[idx] = num
                      return newHints
                    })
                  }}
                />
                <AddButton
                  onClick={() => handleAddMission(idx)}
                  isActive={insertingAt === idx}
                />
                {insertingAt === idx && (
                  <InsertMissionRow
                    defaultPanelId={
                      panelPositions?.positions[idx + 1] ??
                      panelPositions?.positions[idx] ??
                      null
                    }
                    onInsert={handleInsertMission}
                    onCancel={() => {
                      setInsertingAt(null)
                      onInsertPreview?.(null)
                    }}
                    onPreviewChange={(mt, p) =>
                      onInsertPreview?.({
                        afterIndex: idx,
                        missionType: mt,
                        param: p,
                      })
                    }
                    onPreviewClear={() => onInsertPreview?.(null)}
                  />
                )}
              </div>
            ))}
          </SortableContext>
        </DndContext>

        {/* Empty state */}
        {items.length === 0 && insertingAt === null && (
          <button
            type="button"
            className="w-full cursor-pointer rounded-lg border border-base-300 border-dashed p-4 text-center text-base-content/50 text-sm transition-colors hover:border-primary hover:text-primary"
            onClick={() => handleAddMission(-1)}
          >
            ミッションを追加してください
          </button>
        )}

        {/* Goal Row */}
        <GoalRow
          point={point}
          panelNumber={panelPositions?.goalPanel}
          isSelected={selectedMissionIndex === -3}
          onSelect={() => setSelectedMissionIndex(-3)}
          onUpdatePoint={handleUpdateGoalPoint}
        />
      </div>
    </div>
  )
}

// ─── Start Row ───────────────────────────────────────────────────────

function StartRow({
  mission,
  panelNumber,
  isSelected,
  onSelect,
  onUpdateDirection,
}: {
  mission: MissionState
  panelNumber?: number
  isSelected: boolean
  onSelect: () => void
  onUpdateDirection: (dir: MissionValue) => void
}) {
  const dir = mission[0]
  return (
    // biome-ignore lint/a11y/useSemanticElements: complex container with child elements
    <div
      role="button"
      tabIndex={0}
      className={`overflow-hidden rounded-xl transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-pink-400 ring-offset-1"
          : "cursor-pointer hover:shadow-md"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSelect()
        }
      }}
    >
      <div className="flex items-stretch">
        {/* Color accent bar + label */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-gradient-to-b from-pink-400 to-pink-300 px-2 py-2.5">
          <span className="font-bold text-white text-xs tracking-wider">
            START
          </span>
          {panelNumber && (
            <span className="mt-0.5 font-mono text-[10px] text-white/80">
              P{panelNumber}
            </span>
          )}
        </div>
        {/* Content */}
        <div className="flex flex-1 items-center bg-pink-50/60 px-4 py-2.5">
          {isSelected ? (
            <select
              className="select select-bordered select-xs"
              value={(dir as string) ?? ""}
              onChange={(e) => {
                e.stopPropagation()
                onUpdateDirection(e.target.value as MissionValue)
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">向きを選択</option>
              {(["u", "r", "d", "l"] as MissionValue[]).map((v) => (
                <option key={v as string} value={v as string}>
                  {MissionString[v as Exclude<MissionValue, null>]}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-pink-900 text-sm">
              {dir ? MissionString[dir as Exclude<MissionValue, null>] : "-"}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Goal Row ────────────────────────────────────────────────────────

function GoalRow({
  point,
  panelNumber,
  isSelected,
  onSelect,
  onUpdatePoint,
}: {
  point: PointState
  panelNumber?: number
  isSelected: boolean
  onSelect: () => void
  onUpdatePoint: (p: PointEntry) => void
}) {
  const goalPointRaw = point[1]
  const goalPoint = typeof goalPointRaw === "number" ? goalPointRaw : 0
  return (
    // biome-ignore lint/a11y/useSemanticElements: complex container with child elements
    <div
      role="button"
      tabIndex={0}
      className={`overflow-hidden rounded-xl transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-green-400 ring-offset-1"
          : "cursor-pointer hover:shadow-md"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSelect()
        }
      }}
    >
      <div className="flex items-stretch">
        {/* Color accent bar + label */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-gradient-to-b from-green-400 to-green-300 px-2 py-2.5">
          <span className="font-bold text-white text-xs tracking-wider">
            GOAL
          </span>
          {panelNumber && (
            <span className="mt-0.5 font-mono text-[10px] text-white/80">
              P{panelNumber}
            </span>
          )}
        </div>
        {/* Content */}
        <div className="flex flex-1 items-center bg-green-50/60 px-4 py-2.5">
          {isSelected ? (
            // biome-ignore lint/a11y/useSemanticElements: form input group
            <div
              role="group"
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <input
                type="number"
                className="input input-bordered input-xs w-20"
                value={goalPoint}
                onChange={(e) => {
                  const num = Number(e.target.value)
                  onUpdatePoint(
                    e.target.value === "" || Number.isNaN(num) ? 0 : num,
                  )
                }}
                placeholder="0"
              />
              <span className="text-xs">pt</span>
            </div>
          ) : (
            <span className="text-green-900 text-sm">{goalPoint} pt</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sortable Mission Row ────────────────────────────────────────────

function SortableMissionRow({
  item,
  index,
  panelNumber,
  point,
  isSelected,
  isInvalid,
  invalidReason,
  isPlaying = false,
  onSelect,
  onDelete,
  onUpdate,
  onPanelChange,
}: {
  item: MissionPairItem
  index: number
  panelNumber?: number
  point: PointEntry | undefined
  isSelected: boolean
  isInvalid?: boolean
  invalidReason?: string
  isPlaying?: boolean
  onSelect: () => void
  onDelete: () => void
  onUpdate: (
    missionType: MissionValue,
    param: MissionValue,
    pointEntry: PointEntry,
  ) => void
  onPanelChange: (panelNum: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const missionType = item.mission[0]
  const missionParam = item.mission[1]

  const rowRef = useRef<HTMLDivElement>(null)
  const [showMobileError, setShowMobileError] = useState(false)

  useEffect(() => {
    // Skip auto-scroll on mobile to keep the course field visible during playback
    if (isSelected && isPlaying && rowRef.current && window.innerWidth >= 640) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [isSelected, isPlaying])

  useEffect(() => {
    if (!isInvalid) {
      setShowMobileError(false)
    }
  }, [isInvalid])

  const errorMessage =
    invalidReason === "not-at-goal"
      ? "最終ミッションがゴールに到達していません"
      : "コース外の移動です"

  const handleErrorTap = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMobileError((prev) => !prev)
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: sortable container with drag handle
    <div
      ref={(node) => {
        setNodeRef(node)
        ;(rowRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node
      }}
      role="button"
      tabIndex={0}
      style={style}
      className={`group rounded-lg border-2 p-3 transition-all duration-150 ${
        isSelected
          ? "border-primary bg-primary/5"
          : isInvalid
            ? "cursor-pointer border-error border-l-4 bg-error/5 hover:bg-error/10"
            : "cursor-pointer border-transparent bg-base-200/50 hover:bg-base-200"
      } ${isDragging ? "z-50 shadow-lg" : ""}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSelect()
        }
      }}
    >
      {/* Collapsed view */}
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab touch-none text-base-content/30 hover:text-base-content/60"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <Bars3Icon className="size-4" />
        </button>

        {/* Order number */}
        <span className="w-5 font-mono text-base-content/50 text-xs">
          {index + 1}
        </span>

        {/* Panel number */}
        {isSelected ? (
          // biome-ignore lint/a11y/useSemanticElements: form input group
          <div
            role="group"
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <span className="font-mono text-xs">P</span>
            <input
              type="number"
              className="input input-bordered input-xs w-12 font-mono"
              min={1}
              max={25}
              disabled={isPlaying}
              value={panelNumber ?? ""}
              onChange={(e) => {
                const num = Number(e.target.value)
                if (num >= 1 && num <= 25) {
                  onPanelChange(num)
                }
              }}
            />
          </div>
        ) : (
          panelNumber && (
            <span className="badge badge-ghost badge-sm font-mono">
              P{panelNumber}
            </span>
          )
        )}

        {/* Mission content */}
        <div className="flex-1 text-sm">
          {isSelected ? (
            <InlineMissionEditor
              missionType={missionType}
              missionParam={missionParam}
              pointEntry={point ?? 0}
              onUpdate={onUpdate}
              disabled={isPlaying}
            />
          ) : (
            <span>
              {missionType
                ? MissionString[missionType as Exclude<MissionValue, null>]
                : "-"}{" "}
              {missionParam !== null ? `${missionParam}` : ""}
              {getMissionParameterUnit(missionType)}
            </span>
          )}
        </div>

        {/* Point display (collapsed) */}
        {!isSelected && (
          <span className="font-mono text-base-content/60 text-xs">
            {Array.isArray(point) ? `[${point.join(",")}]` : (point ?? 0)} pt
          </span>
        )}

        {/* Invalid indicator */}
        {isInvalid && !isSelected && (
          <>
            {/* PC: tooltip on hover */}
            <div
              className="tooltip tooltip-left hidden sm:block"
              data-tip={errorMessage}
            >
              <ExclamationTriangleIcon className="size-4 text-error" />
            </div>
            {/* Mobile: tap to show message */}
            <button
              type="button"
              className="sm:hidden"
              onClick={handleErrorTap}
            >
              <ExclamationTriangleIcon className="size-4 text-error" />
            </button>
          </>
        )}

        {/* Delete button */}
        <button
          type="button"
          className="btn btn-ghost btn-xs text-error"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="削除"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
      {/* Mobile error message */}
      {isInvalid && showMobileError && !isSelected && (
        <p className="mt-1 text-error text-xs sm:hidden">{errorMessage}</p>
      )}
    </div>
  )
}

// ─── Inline Mission Editor ───────────────────────────────────────────

function InlineMissionEditor({
  missionType,
  missionParam,
  pointEntry,
  onUpdate,
  disabled = false,
}: {
  missionType: MissionValue
  missionParam: MissionValue
  pointEntry: PointEntry
  onUpdate: (
    missionType: MissionValue,
    param: MissionValue,
    pointEntry: PointEntry,
  ) => void
  disabled?: boolean
}) {
  const isMove = missionType === "mf" || missionType === "mb"
  const isTurn = missionType === "tr" || missionType === "tl"
  const isPause = missionType === "ps"
  const tierMode = Array.isArray(pointEntry)
  const tierValues = Array.isArray(pointEntry) ? pointEntry : [0]
  const singleValue =
    pointEntry !== null && !Array.isArray(pointEntry) ? pointEntry : 0

  return (
    <fieldset
      disabled={disabled}
      className="space-y-2"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="select select-bordered select-xs"
          value={(missionType as string) ?? ""}
          onChange={(e) => {
            const val = e.target.value as MissionValue
            const defaultParam =
              val === "ps"
                ? 0
                : val === "mf" || val === "mb"
                  ? 1
                  : val === "tr" || val === "tl"
                    ? 90
                    : null
            if (defaultParam !== null) {
              onUpdate(val, defaultParam, pointEntry)
            }
          }}
        >
          <option value="">選択</option>
          {(["mf", "mb", "tr", "tl", "ps"] as MissionValue[]).map((v) => (
            <option key={v as string} value={v as string}>
              {MissionString[v as Exclude<MissionValue, null>]}
            </option>
          ))}
        </select>

        {isMove && (
          <>
            <select
              className="select select-bordered select-xs"
              value={(missionParam as string) ?? ""}
              onChange={(e) =>
                onUpdate(missionType, Number(e.target.value), pointEntry)
              }
            >
              <option value="">選択</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-xs">パネル</span>
          </>
        )}

        {isTurn && (
          <>
            <select
              className="select select-bordered select-xs"
              value={(missionParam as string) ?? ""}
              onChange={(e) =>
                onUpdate(missionType, Number(e.target.value), pointEntry)
              }
            >
              <option value="">選択</option>
              {[90, 180, 270, 360].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-xs">度</span>
          </>
        )}

        {isPause && (
          <span className="text-base-content/50 text-xs">パラメータなし</span>
        )}
      </div>

      {/* Point settings */}
      {(isMove || isTurn || isPause) && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="label cursor-pointer gap-1">
              <input
                type="radio"
                name={`pointMode-${missionType}-${missionParam}`}
                className="radio radio-xs"
                checked={!tierMode}
                onChange={() =>
                  onUpdate(
                    missionType,
                    missionParam,
                    Array.isArray(pointEntry)
                      ? (pointEntry[0] ?? 0)
                      : pointEntry,
                  )
                }
              />
              <span className="text-xs">単一</span>
            </label>
            <label className="label cursor-pointer gap-1">
              <input
                type="radio"
                name={`pointMode-${missionType}-${missionParam}`}
                className="radio radio-xs"
                checked={tierMode}
                onChange={() =>
                  onUpdate(missionType, missionParam, [
                    typeof pointEntry === "number" ? pointEntry : 0,
                    0,
                  ])
                }
              />
              <span className="text-xs">段階</span>
            </label>
          </div>

          {!tierMode ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                className="input input-bordered input-xs w-16"
                value={singleValue}
                onChange={(e) => {
                  const num = Number(e.target.value)
                  onUpdate(
                    missionType,
                    missionParam,
                    e.target.value === "" || Number.isNaN(num) ? 0 : num,
                  )
                }}
              />
              <span className="text-xs">pt</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              {tierValues.map((val, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: tier values may duplicate
                  key={i}
                  className="flex items-center gap-0.5"
                >
                  <span className="text-[10px] text-base-content/40">
                    {i + 1}.
                  </span>
                  <input
                    type="number"
                    className="input input-bordered input-xs w-14"
                    value={val}
                    onChange={(e) => {
                      const num = Number(e.target.value)
                      const newTiers = [...tierValues]
                      newTiers[i] =
                        e.target.value === "" || Number.isNaN(num) ? 0 : num
                      onUpdate(missionType, missionParam, newTiers)
                    }}
                  />
                  {tierValues.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => {
                        const newTiers = tierValues.filter((_, ti) => ti !== i)
                        onUpdate(missionType, missionParam, newTiers)
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-xs text-primary"
                onClick={() =>
                  onUpdate(missionType, missionParam, [...tierValues, 0])
                }
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </fieldset>
  )
}

// ─── Insert Mission Row ──────────────────────────────────────────────

function InsertMissionRow({
  defaultPanelId,
  onInsert,
  onCancel,
  onPreviewChange,
  onPreviewClear,
}: {
  defaultPanelId: number | null
  onInsert: (
    missionType: MissionValue,
    param: number,
    pointEntry: PointEntry,
    panelHint: number | null,
  ) => void
  onCancel: () => void
  onPreviewChange?: (missionType: MissionValue, param: number) => void
  onPreviewClear?: () => void
}) {
  const [missionType, setMissionType] = useState<MissionValue | null>(null)
  const [param, setParam] = useState<number | null>(null)
  const [pointEntry, setPointEntry] = useState<PointEntry>(0)
  const [panelId, setPanelId] = useState<number | null>(defaultPanelId)

  const isMove = missionType === "mf" || missionType === "mb"
  const isTurn = missionType === "tr" || missionType === "tl"
  const isPause = missionType === "ps"
  const canInsert = missionType !== null && (param !== null || isPause)

  function handleMissionTypeChange(val: MissionValue) {
    setMissionType(val)
    let newParam: number | null
    if (val === "ps") {
      newParam = 0
    } else if (val === "mf" || val === "mb") {
      newParam = 1
    } else if (val === "tr" || val === "tl") {
      newParam = 90
    } else {
      newParam = null
    }
    setParam(newParam)
    if (val && newParam !== null) {
      onPreviewChange?.(val, newParam)
    } else {
      onPreviewClear?.()
    }
  }

  function handleParamChange(newParam: number) {
    setParam(newParam)
    if (missionType) {
      onPreviewChange?.(missionType, newParam)
    }
  }

  return (
    <div className="rounded-lg border-2 border-primary/40 border-dashed bg-primary/5 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Panel ID */}
        <div className="flex items-center gap-0.5">
          <span className="font-mono text-xs">P</span>
          <input
            type="number"
            className="input input-bordered input-xs w-12 font-mono"
            min={1}
            max={25}
            value={panelId ?? ""}
            onChange={(e) => {
              const num = Number(e.target.value)
              if (e.target.value === "") {
                setPanelId(null)
              } else if (num >= 1 && num <= 25) {
                setPanelId(num)
              }
            }}
            placeholder="-"
          />
        </div>

        <select
          className="select select-bordered select-xs"
          value={(missionType as string) ?? ""}
          onChange={(e) =>
            handleMissionTypeChange(e.target.value as MissionValue)
          }
        >
          <option value="">ミッション選択</option>
          {(["mf", "mb", "tr", "tl", "ps"] as MissionValue[]).map((v) => (
            <option key={v as string} value={v as string}>
              {MissionString[v as Exclude<MissionValue, null>]}
            </option>
          ))}
        </select>

        {isMove && (
          <>
            <select
              className="select select-bordered select-xs"
              value={param ?? ""}
              onChange={(e) => handleParamChange(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-xs">パネル</span>
          </>
        )}

        {isTurn && (
          <>
            <select
              className="select select-bordered select-xs"
              value={param ?? ""}
              onChange={(e) => handleParamChange(Number(e.target.value))}
            >
              {[90, 180, 270, 360].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-xs">度</span>
          </>
        )}

        <div className="flex items-center gap-1">
          <input
            type="number"
            className="input input-bordered input-xs w-16"
            value={typeof pointEntry === "number" ? pointEntry : 0}
            onChange={(e) => {
              const num = Number(e.target.value)
              setPointEntry(
                e.target.value === "" || Number.isNaN(num) ? 0 : num,
              )
            }}
            placeholder="pt"
          />
          <span className="text-xs">pt</span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-xs"
          disabled={!canInsert}
          onClick={() => {
            if (canInsert) {
              onInsert(missionType, param ?? 0, pointEntry, panelId)
            }
          }}
        >
          追加
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={onCancel}
        >
          取消
        </button>
      </div>
    </div>
  )
}

// ─── Add Button ──────────────────────────────────────────────────────

function AddButton({
  onClick,
  isActive,
}: {
  onClick: () => void
  isActive: boolean
}) {
  if (isActive) {
    return null
  }
  return (
    <div className="flex h-5 items-center justify-center">
      <button
        type="button"
        className="flex size-5 items-center justify-center rounded-full border border-base-300 bg-base-100 shadow-sm transition-colors hover:border-primary hover:bg-primary/10"
        onClick={onClick}
        title="ミッションを追加"
      >
        <PlusIcon className="size-3 text-primary" />
      </button>
    </div>
  )
}
