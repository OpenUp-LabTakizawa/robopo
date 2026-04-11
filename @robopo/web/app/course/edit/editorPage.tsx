"use client"

import { CheckCircleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
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
    if (name.trim() === "") {
      alert("コース名を入力してください")
      return
    }
    if (nameError) {
      alert(nameError)
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
    <div className="h-full w-full">
      <div className="gap-4 sm:grid sm:max-h-screen sm:grid-cols-2">
        <div className="sm:w-full sm:justify-self-end">
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
            disabled={isBusy}
            courseId={courseId}
          />
        </div>
        <div className="sm:mx-4 sm:w-full sm:justify-self-start">
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
          />
        </div>
      </div>
      <div className="mt-0 flex justify-center gap-4 p-4">
        <Link
          href={
            courseId ? `/course/edit/${courseId}/valid/` : `/course/edit/valid/`
          }
          className={`btn btn-primary min-w-28 max-w-fit ${isBusy ? "btn-disabled" : ""}`}
          aria-disabled={isBusy}
          tabIndex={isBusy ? -1 : undefined}
        >
          有効性チェック
        </Link>
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
            className="btn btn-primary min-w-28 max-w-fit"
            disabled={isBusy}
            onClick={handleSave}
          >
            {saveState === "saving" ? (
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
    </div>
  )
}
