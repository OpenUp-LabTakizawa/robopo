"use client"

import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  buildPreviewMission,
  type InsertPreview,
} from "@/app/components/course/missionList"
import { computeRobotPreview } from "@/app/components/course/robotPreview"
import {
  deserializeField,
  deserializeMission,
  deserializePoint,
  findStart,
  missionStatePair,
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
    resetInitialized,
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null)
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const playbackCount = useMemo(
    () => missionStatePair(mission).length,
    [mission],
  )

  const canPlay =
    playbackCount > 0 && mission[0] !== null && findStart(field) !== null

  const clearPlaybackTimer = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current)
      playbackTimerRef.current = null
    }
  }, [])

  // Auto-advance playback timer
  useEffect(() => {
    if (!isPlaying) {
      setPlaybackIndex(null)
      clearPlaybackTimer()
      return
    }

    setPlaybackIndex(0)

    playbackTimerRef.current = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev === null || prev + 1 >= playbackCount) {
          setIsPlaying(false)
          return null
        }
        return prev + 1
      })
    }, 2400)

    return clearPlaybackTimer
  }, [isPlaying, playbackCount, clearPlaybackTimer])

  const wasPlayingRef = useRef(false)

  // Sync selectedMissionIndex from playback index
  useEffect(() => {
    if (isPlaying) {
      wasPlayingRef.current = true
      setSelectedMissionIndex(playbackIndex)
      setInsertPreview(null)
    } else if (wasPlayingRef.current) {
      // Playback just stopped — clear selection
      wasPlayingRef.current = false
      setSelectedMissionIndex(null)
    }
  }, [isPlaying, playbackIndex])

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

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
    // Reset before loading so re-runs (e.g. React strict mode) don't falsely mark dirty
    resetInitialized()
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
      // Default to route tool when editing an existing course
      setSelectedTool("route")
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
    setSelectedTool,
    markInitialized,
    resetInitialized,
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
            isPlaying={isPlaying}
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
            disabled={isBusy || isPlaying}
            courseId={courseId}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            canPlay={canPlay}
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
              className="btn btn-success min-w-28 max-w-fit rounded-xl shadow-lg shadow-success/20 transition-all duration-200"
            >
              保存成功
              <CheckCircleIcon className="size-5" />
            </button>
          ) : (
            <button
              type="button"
              className={`btn min-w-28 max-w-fit rounded-xl transition-all duration-200 ${validation.canSave && !isBusy ? "btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:shadow-xl" : "btn-disabled"}`}
              disabled={!validation.canSave || isBusy}
              onClick={handleSave}
            >
              {isBusy ? (
                <>
                  保存中
                  <span className="loading loading-spinner loading-sm" />
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="size-5" />
                  保存
                </>
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
