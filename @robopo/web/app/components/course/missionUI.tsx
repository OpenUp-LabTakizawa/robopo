import type React from "react"
import { useEffect, useState } from "react"
import {
  type MissionState,
  MissionString,
  type MissionValue,
  type PointEntry,
  type PointState,
  type PointValue,
} from "@/app/components/course/utils"

// Start select
function StartSelect({
  selectedMission,
  onMissionChange,
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
          onChange={onMissionChange}
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

// Goal select - free number input
function GoalSelect({
  selectedPoint,
  onPointInputChange,
}: {
  selectedPoint: PointValue | null
  onPointInputChange: (value: number) => void
}) {
  return (
    <>
      <p>ゴールポイント</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="input input-bordered w-24"
          value={selectedPoint ?? ""}
          onChange={(e) => {
            const raw = e.target.value
            const num = Number(raw)
            onPointInputChange(raw === "" || Number.isNaN(num) ? 0 : num)
          }}
          placeholder="0"
        />
        <span>ポイント</span>
      </div>
    </>
  )
}

// Normal mission select with free point input and tier support
function MissionSelect({
  selectedMission,
  selectedParam,
  selectedPointEntry,
  onMissionChange,
  onParamChange,
  onPointEntryChange,
}: {
  selectedMission: MissionValue | null
  selectedParam: number | null
  selectedPointEntry: PointEntry | null
  onMissionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onParamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onPointEntryChange: (entry: PointEntry) => void
}) {
  const isMove = selectedMission === "mf" || selectedMission === "mb"
  const isTurn = selectedMission === "tr" || selectedMission === "tl"
  const isPause = selectedMission === "ps"
  const hasParam = isMove || isTurn

  // Tier mode derived from props (single source of truth)
  const tierMode = Array.isArray(selectedPointEntry)

  // Single point value (for non-tier mode)
  const singleValue =
    selectedPointEntry !== null && !Array.isArray(selectedPointEntry)
      ? selectedPointEntry
      : null
  // Tier values
  const tierValues = Array.isArray(selectedPointEntry)
    ? selectedPointEntry
    : [0]

  function handleTierModeChange(useTier: boolean) {
    if (useTier) {
      // Switch to tier: wrap existing single value in an array
      const base =
        selectedPointEntry !== null && !Array.isArray(selectedPointEntry)
          ? selectedPointEntry
          : 0
      onPointEntryChange([base, 0])
    } else {
      // Switch to single: collapse array to first element
      const first = Array.isArray(selectedPointEntry)
        ? (selectedPointEntry[0] ?? 0)
        : 0
      onPointEntryChange(first)
    }
  }

  function handleSinglePointChange(raw: string) {
    const num = Number(raw)
    onPointEntryChange(raw === "" || Number.isNaN(num) ? 0 : num)
  }

  function handleTierValueChange(index: number, raw: string) {
    const num = Number(raw)
    const newTiers = [...tierValues]
    newTiers[index] = raw === "" || Number.isNaN(num) ? 0 : num
    onPointEntryChange(newTiers)
  }

  function addTier() {
    onPointEntryChange([...tierValues, 0])
  }

  function removeTier(index: number) {
    if (tierValues.length <= 2) {
      return
    }
    const newTiers = tierValues.filter((_, i) => i !== index)
    onPointEntryChange(newTiers)
  }

  return (
    <>
      <p>ミッション選択</p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="select select-bordered"
          value={selectedMission ?? ""}
          onChange={onMissionChange}
        >
          <option value="">選択</option>
          {(
            ["mf", "mb", "tr", "tl", "ps"] as Exclude<MissionValue, null>[]
          ).map((v) => (
            <option key={v} value={v}>
              {MissionString[v]}
            </option>
          ))}
        </select>

        {isMove && (
          <select
            className="select select-bordered"
            value={selectedParam ?? ""}
            onChange={onParamChange}
          >
            <option value="">選択</option>
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        )}
        {isMove && <span>パネル</span>}

        {isTurn && (
          <select
            className="select select-bordered"
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
        )}
        {isTurn && <span>度</span>}

        {isPause && (
          <span className="text-base-content/60">パラメータなし</span>
        )}

        {!hasParam && !isPause && <span>{"<"}-選択してください</span>}
      </div>

      {/* Point settings - shown when mission type is selected */}
      {(hasParam || isPause) && (
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-bold text-sm">ポイント方式:</span>
            <label className="label cursor-pointer gap-1">
              <input
                type="radio"
                name="pointMode"
                className="radio radio-sm"
                checked={!tierMode}
                onChange={() => handleTierModeChange(false)}
              />
              <span className="label-text">単一値</span>
            </label>
            <label className="label cursor-pointer gap-1">
              <input
                type="radio"
                name="pointMode"
                className="radio radio-sm"
                checked={tierMode}
                onChange={() => handleTierModeChange(true)}
              />
              <span className="label-text">段階選択</span>
            </label>
          </div>

          {!tierMode ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="input input-bordered w-24"
                value={singleValue ?? ""}
                onChange={(e) => handleSinglePointChange(e.target.value)}
                placeholder="0"
              />
              <span>ポイント</span>
            </div>
          ) : (
            <div className="space-y-1">
              {tierValues.map((val, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: tiers may have duplicate values, need index for uniqueness
                <div key={i} className="flex items-center gap-2">
                  <span className="w-8 text-base-content/50 text-xs">
                    {i + 1}.
                  </span>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-20"
                    value={val}
                    onChange={(e) => handleTierValueChange(i, e.target.value)}
                  />
                  <span className="text-sm">pt</span>
                  {tierValues.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => removeTier(i)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-xs text-primary"
                onClick={addTier}
              >
                + 段階追加
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export function MissionUI({
  mission,
  setMission,
  point,
  radio,
  setPoint,
  selectedId,
  selectedMission,
  setSelectedMission,
  selectedParam,
  setSelectedParam,
  selectedPoint,
  setSelectedPoint,
  setRadio,
  setAddOrder,
}: {
  mission: MissionState
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  point: PointState
  radio: number | null
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
  selectedId: number | null
  selectedMission: MissionValue | null
  setSelectedMission: React.Dispatch<React.SetStateAction<MissionValue | null>>
  selectedParam: number | null
  setSelectedParam: React.Dispatch<React.SetStateAction<number | null>>
  selectedPoint: PointValue | null
  setSelectedPoint: React.Dispatch<React.SetStateAction<PointValue | null>>
  setRadio: React.Dispatch<React.SetStateAction<number | null>>
  setAddOrder: React.Dispatch<React.SetStateAction<number>>
}) {
  // Extended point entry state (supports tiers)
  const [pointEntry, setPointEntry] = useState<PointEntry | null>(null)

  // Sync pointEntry from existing point data when selectedId changes
  useEffect(() => {
    if (selectedId !== null && selectedId >= 0) {
      const existingPoint = point[selectedId + 2]
      if (existingPoint !== undefined) {
        setPointEntry(existingPoint)
      } else {
        setPointEntry(null)
      }
    } else {
      setPointEntry(null)
    }
  }, [selectedId, point])

  function handleMissionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (event.target.value === "") {
      setSelectedMission(null)
      setSelectedParam(null)
      setSelectedPoint(null)
      setPointEntry(null)
    } else {
      const val = event.target.value as MissionValue
      setSelectedMission(val)
      // Auto-set param for pause (no param needed)
      if (val === "ps") {
        setSelectedParam(0)
      }
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

  function handlePointEntryChange(entry: PointEntry) {
    setPointEntry(entry)
    // Keep selectedPoint in sync for compatibility
    if (Array.isArray(entry)) {
      setSelectedPoint(entry[0] ?? 0)
    } else {
      setSelectedPoint(entry)
    }
  }

  function handleGoalPointChange(value: number) {
    setSelectedPoint(value)
    setPointEntry(value)
  }

  // Reset UI
  function resetUi() {
    setSelectedMission(null)
    setSelectedParam(null)
    setSelectedPoint(null)
    setPointEntry(null)
    setRadio(null)
    setAddOrder(-1)
  }

  function isStartGoal() {
    return selectedId === -2 || selectedId === -3
  }

  function getEffectivePointEntry(): PointEntry {
    if (pointEntry !== null) {
      return pointEntry
    }
    if (selectedPoint !== null) {
      return selectedPoint
    }
    return 0
  }

  function addMission(
    selectedId: number,
    selectedMission: MissionValue,
    selectedParam: number,
    effectivePoint: PointEntry,
    mission: MissionState,
    point: PointState,
  ) {
    const newMissionState = [...mission]
    const newPointState = [...point]
    if (selectedId === -1) {
      newMissionState[2] = selectedMission
      newMissionState[3] = selectedParam
      newPointState[2] = effectivePoint
    } else {
      const INSERT_AT_START_ID = -4
      const insertIndex =
        selectedId === INSERT_AT_START_ID ? 2 : 2 * selectedId + 4
      newMissionState.splice(insertIndex, 0, selectedMission, selectedParam)
      newPointState.splice(selectedId + 3, 0, effectivePoint)
    }
    return { newMissionState, newPointState }
  }

  function updateMission(
    selectedId: number,
    selectedMission: MissionValue,
    selectedParam: number,
    effectivePoint: PointEntry,
    mission: MissionState,
    point: PointState,
  ) {
    const newMissionState = [...mission]
    const newPointState = [...point]
    newMissionState[2 * selectedId + 2] = selectedMission
    newMissionState[2 * selectedId + 3] = selectedParam
    newPointState[selectedId + 2] = effectivePoint
    return { newMissionState, newPointState }
  }

  function handleButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
    const { id } = event.currentTarget.dataset
    if (selectedId === null) {
      return
    }

    let newStates = { newMissionState: [...mission], newPointState: [...point] }
    const effectivePoint = getEffectivePointEntry()

    if (isStartGoal() && id === "update") {
      const newMissionState = [...mission]
      const newPointState = [...point]
      if (selectedId === -2) {
        newMissionState[0] = selectedMission
        newPointState[0] = 0
      } else {
        newMissionState[1] = null
        newPointState[1] = effectivePoint
      }
      newStates = { newMissionState, newPointState }
    } else if (id === "add" && selectedMission && selectedParam !== null) {
      newStates = addMission(
        selectedId,
        selectedMission,
        selectedParam,
        effectivePoint,
        mission,
        point,
      )
    } else if (
      id === "update" &&
      selectedMission &&
      selectedParam !== null &&
      selectedId !== -1
    ) {
      newStates = updateMission(
        selectedId,
        selectedMission,
        selectedParam,
        effectivePoint,
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

  const isPause = selectedMission === "ps"
  const hasValidMission =
    selectedMission !== null && (selectedParam !== null || isPause)

  return (
    <div>
      <div>MissionUI</div>
      <div className="container">
        {selectedId === -2 && radio === -2 ? (
          <StartSelect
            selectedMission={selectedMission}
            onMissionChange={handleMissionChange}
          />
        ) : selectedId === -3 ? (
          <GoalSelect
            selectedPoint={selectedPoint}
            onPointInputChange={handleGoalPointChange}
          />
        ) : selectedId === null ? (
          <p>上のいずれかを選択してください</p>
        ) : (
          <MissionSelect
            selectedMission={selectedMission}
            selectedParam={selectedParam}
            selectedPointEntry={pointEntry}
            onMissionChange={handleMissionChange}
            onParamChange={handleParamChange}
            onPointEntryChange={handlePointEntryChange}
          />
        )}
      </div>
      <div className="mt-2 grid grid-cols-4">
        <div />
        <button
          type="button"
          data-id="add"
          className="btn btn-primary mx-auto"
          disabled={
            isStartGoal() ||
            radio !== -1 ||
            selectedId === null ||
            !hasValidMission
          }
          onClick={handleButtonClick}
        >
          追加
        </button>
        <button
          type="button"
          data-id="update"
          className="btn btn-primary mx-auto"
          onClick={handleButtonClick}
          disabled={
            selectedId === null ||
            radio === -1 ||
            (selectedId !== -2 && selectedId !== -3 && !hasValidMission) ||
            (selectedId === -3 && selectedPoint === null) ||
            (selectedId === -2 && selectedMission === null)
          }
        >
          更新
        </button>
        <button
          type="button"
          data-id="delete"
          className="btn btn-warning mx-auto"
          onClick={handleButtonClick}
          disabled={isStartGoal() || selectedId === null || radio === -1}
        >
          削除
        </button>
      </div>
    </div>
  )
}
