"use client"

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  buildPreviewMission,
  type InsertPreview,
} from "@/app/components/course/missionList"
import { computeRobotPreview } from "@/app/components/course/robotPreview"
import {
  deserializeField,
  deserializeMission,
  deserializePoint,
  serializeField,
  serializeMission,
  serializePoint,
} from "@/app/components/course/utils"
import { BackButton } from "@/app/components/parts/buttons"
import CourseEdit from "@/app/course/edit/courseEdit"
import { useCourseEdit } from "@/app/course/edit/courseEditContext"
import MissionEdit from "@/app/course/edit/missionEdit"
import { useCourseValidation } from "@/app/hooks/useCourseValidation"
import { useNavigationGuard } from "@/app/hooks/useNavigationGuard"
import type { SelectCourse } from "@/app/lib/db/schema"

type SaveState = "idle" | "saving" | "success" | "error"

export function EditorPage({
  courseData,
}: {
  courseData: SelectCourse | null
}) {
  const courseId = courseData?.id || null

  const {
    name,
    setName,
    description,
    setDescription,
    field,
    setField,
    mission,
    setMission,
    point,
    setPoint,
    courseOutRule,
    setCourseOutRule,
    selectedTool,
    setSelectedTool,
    undo,
    redo,
    canUndo,
    canRedo,
    pushHistory,
    undoMission,
    redoMission,
    canUndoMission,
    canRedoMission,
    pushMissionHistory,
    missionPanelHints,
    setMissionPanelHints,
    markInitialized,
    nameError,
  } = useCourseEdit()

  const { setDirty } = useNavigationGuard()

  // Lifted from MissionEdit for cross-component access
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<
    number | null
  >(null)
  const [insertPreview, setInsertPreview] = useState<InsertPreview | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [showSaveWarning, setShowSaveWarning] = useState(false)
  const [mounted, setMounted] = useState(false)

  const validation = useCourseValidation({ field, mission, name, nameError })
  const saveBlockMessage = mounted ? validation.saveBlockMessage : null

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!saveBlockMessage) {
      setShowSaveWarning(false)
    }
  }, [saveBlockMessage])

  useEffect(() => {
    if (courseData) {
      if (courseData.field) {
        setField(deserializeField(courseData.field))
      }
      if (courseData.mission) {
        setMission(deserializeMission(courseData.mission))
      }
      if (courseData.point) {
        setPoint(deserializePoint(courseData.point))
      }
      if (courseData.name) {
        setName(courseData.name)
      }
      if (courseData.description) {
        setDescription(courseData.description)
      }
      if (courseData.courseOutRule) {
        setCourseOutRule(courseData.courseOutRule)
      }
    }
    // Mark initialized after initial data load so dirty tracking starts
    markInitialized()
  }, [
    courseData,
    setField,
    setMission,
    setPoint,
    setName,
    setDescription,
    setCourseOutRule,
    markInitialized,
  ])

  const robotPreview = useMemo(() => {
    if (insertPreview) {
      const { missionWithInsert, selectedIndex } = buildPreviewMission(
        mission,
        insertPreview,
      )
      return computeRobotPreview(field, missionWithInsert, selectedIndex)
    }
    return computeRobotPreview(field, mission, selectedMissionIndex)
  }, [field, mission, selectedMissionIndex, insertPreview])

  // Auto-add an empty mission when a route panel is placed
  const handleRouteAdded = useCallback(
    (row: number, col: number) => {
      pushMissionHistory()
      const panelNumber = row * 5 + col + 1
      const autoAddedCount = missionPanelHints.filter((h) => h !== null).length
      setMission((prev) => {
        const newMission = [...prev]
        while (newMission.length < 4) {
          newMission.push(null)
        }
        const insertAt = 4 + autoAddedCount * 2
        newMission.splice(insertAt, 0, null, null)
        return newMission
      })
      setPoint((prev) => {
        const newPoint = [...prev]
        while (newPoint.length < 3) {
          newPoint.push(0)
        }
        const insertAt = 3 + autoAddedCount
        newPoint.splice(insertAt, 0, 0)
        return newPoint
      })
      setMissionPanelHints((prev) => {
        const newHints = [...prev]
        const hintInsertAt = 1 + autoAddedCount
        newHints.splice(hintInsertAt, 0, panelNumber)
        return newHints
      })
    },
    [
      pushMissionHistory,
      setMission,
      setPoint,
      setMissionPanelHints,
      missionPanelHints,
    ],
  )

  async function handleSave() {
    if (!validation.canSave) {
      return
    }

    setSaveState("saving")

    const data = {
      name: name,
      description: description.trim() || null,
      field: serializeField(field),
      mission: serializeMission(mission),
      point: serializePoint(point),
      courseOutRule: courseOutRule,
    }

    try {
      const res = await fetch(
        courseId ? `/api/course?id=${courseId}` : "/api/course",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      )
      if (res.ok) {
        setSaveState("success")
        setDirty(false)
        setTimeout(() => {
          window.location.replace("/course")
        }, 800)
      } else {
        setSaveState("error")
        alert("コースの保存に失敗しました")
        setSaveState("idle")
      }
    } catch {
      setSaveState("error")
      alert("コースの保存に失敗しました")
      setSaveState("idle")
    }
  }

  const isBusy = saveState === "saving" || saveState === "success"

  return (
    <div className="h-full w-full sm:flex sm:h-[calc(100dvh-56px)] sm:flex-col sm:overflow-hidden">
      <div className="gap-4 sm:grid sm:min-h-0 sm:flex-1 sm:grid-cols-2 sm:grid-rows-[1fr]">
        <div className="sm:min-h-0 sm:w-full sm:justify-self-end sm:overflow-y-auto">
          <CourseEdit
            field={field}
            setField={setField}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            pushHistory={pushHistory}
            botPosition={
              robotPreview
                ? { row: robotPreview.row, col: robotPreview.col }
                : undefined
            }
            botDirection={robotPreview?.direction}
            botAfterPosition={
              robotPreview?.afterRow !== undefined &&
              robotPreview?.afterCol !== undefined
                ? { row: robotPreview.afterRow, col: robotPreview.afterCol }
                : undefined
            }
            botAfterAngle={robotPreview?.afterAngle}
            onRouteAdded={handleRouteAdded}
            isolatedPanels={validation.isolatedPanels}
          />
        </div>
        <div className="sm:mx-4 sm:min-h-0 sm:w-full sm:justify-self-start sm:overflow-y-auto">
          <MissionEdit
            field={field}
            mission={mission}
            setMission={setMission}
            point={point}
            setPoint={setPoint}
            courseOutRule={courseOutRule}
            setCourseOutRule={setCourseOutRule}
            selectedMissionIndex={selectedMissionIndex}
            setSelectedMissionIndex={setSelectedMissionIndex}
            undoMission={undoMission}
            redoMission={redoMission}
            canUndoMission={canUndoMission}
            canRedoMission={canRedoMission}
            pushMissionHistory={pushMissionHistory}
            missionPanelHints={missionPanelHints}
            setMissionPanelHints={setMissionPanelHints}
            onInsertPreview={setInsertPreview}
            invalidMissionMap={validation.invalidMissionMap}
            disabled={isBusy}
            courseId={courseId}
          />
        </div>
      </div>
      <div className="mt-0 flex flex-col items-center gap-2 p-4">
        <div className="flex items-center justify-center gap-4">
          {saveBlockMessage && (
            <>
              {/* PC: tooltip on hover */}
              <div
                className="tooltip tooltip-right hidden sm:inline-flex"
                data-tip={saveBlockMessage}
              >
                <ExclamationTriangleIcon className="size-5 text-warning" />
              </div>
              {/* Mobile: tap to toggle message */}
              <button
                type="button"
                className="sm:hidden"
                onClick={() => setShowSaveWarning((prev) => !prev)}
              >
                <ExclamationTriangleIcon className="size-5 text-warning" />
              </button>
            </>
          )}
          {saveState === "success" ? (
            <button
              type="button"
              disabled
              className="btn btn-success min-w-28 max-w-fit"
            >
              保存成功
              <CheckCircleIcon className="size-5" />
            </button>
          ) : (
            <button
              type="button"
              className={`btn min-w-28 max-w-fit ${validation.canSave && !isBusy ? "btn-primary" : "btn-disabled"}`}
              disabled={!validation.canSave || isBusy}
              onClick={handleSave}
            >
              {isBusy ? (
                <>
                  保存中
                  <span className="loading loading-spinner loading-sm" />
                </>
              ) : (
                "保存"
              )}
            </button>
          )}
          <BackButton
            onClick={() => {
              window.location.href = "/course"
            }}
            disabled={isBusy}
          />
        </div>
        {showSaveWarning && saveBlockMessage && (
          <p className="text-sm text-warning sm:hidden">{saveBlockMessage}</p>
        )}
      </div>
    </div>
  )
}
