"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { computeRobotPreview } from "@/app/components/course/robotPreview"
import {
  deserializeField,
  deserializeMission,
  deserializePoint,
} from "@/app/components/course/utils"
import CourseEdit from "@/app/course/edit/courseEdit"
import { useCourseEdit } from "@/app/course/edit/courseEditContext"
import MissionEdit from "@/app/course/edit/missionEdit"
import { BackLabelWithIcon } from "@/app/lib/const"
import type { SelectCourse } from "@/app/lib/db/schema"

export function EditorPage({
  courseData,
}: {
  courseData: SelectCourse | null
}) {
  const courseId = courseData?.id || null

  const {
    setName,
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
  } = useCourseEdit()

  // Lifted from MissionEdit for cross-component access
  const [selectedMissionIndex, setSelectedMissionIndex] = useState<
    number | null
  >(null)

  useEffect(() => {
    async function fetchCourseData() {
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
        if (courseData.courseOutRule) {
          setCourseOutRule(courseData.courseOutRule)
        }
      }
    }
    fetchCourseData()
  }, [courseData, setField, setMission, setPoint, setName, setCourseOutRule])

  const robotPreview = useMemo(
    () => computeRobotPreview(field, mission, selectedMissionIndex),
    [field, mission, selectedMissionIndex],
  )

  // Auto-add an empty mission when a route panel is placed
  // Inserts after the start action (pair 0) + any previously auto-added routes
  const handleRouteAdded = useCallback(
    (row: number, col: number) => {
      pushMissionHistory()
      const panelNumber = row * 5 + col + 1
      // Insert position: after start action (pair 0) + existing auto-added count
      const autoAddedCount = missionPanelHints.filter((h) => h !== null).length
      setMission((prev) => {
        const newMission = [...prev]
        while (newMission.length < 4) {
          newMission.push(null)
        }
        // Insert after pair 0 + autoAddedCount pairs
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
      // Hint index matches mission pair index: insert at 1 + autoAddedCount
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

  return (
    <div className="h-full w-full">
      <div className="gap-4 sm:grid sm:max-h-screen sm:grid-cols-2">
        <div className="sm:w-full sm:justify-self-end">
          <CourseEdit
            field={field}
            setField={setField}
            courseOutRule={courseOutRule}
            setCourseOutRule={setCourseOutRule}
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
          />
        </div>
        <div className="sm:mx-4 sm:w-full sm:justify-self-start">
          <MissionEdit
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
          />
        </div>
      </div>
      <div className="mt-0 flex justify-center gap-4 p-4">
        <Link
          href={
            courseId ? `/course/edit/${courseId}/valid/` : `/course/edit/valid/`
          }
          className="btn btn-primary min-w-28 max-w-fit"
        >
          有効性チェック
        </Link>
        <Link
          href={
            courseId ? `/course/edit/${courseId}/save/` : `/course/edit/save/`
          }
          className="btn btn-primary min-w-28 max-w-fit"
        >
          コースを保存
        </Link>
        <Link
          href={
            courseId ? `/course/edit/${courseId}/back/` : `/course/edit/back/`
          }
          className="btn btn-primary min-w-28 max-w-fit"
        >
          一覧に
          <BackLabelWithIcon />
        </Link>
      </div>
    </div>
  )
}
