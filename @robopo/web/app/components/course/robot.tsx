import Image from "next/image"
import { useEffect, useState } from "react"
import { type MissionValue, PANEL_SIZE } from "@/app/lib/course/types"

function dirToDeg(dir: MissionValue): number {
  switch (dir) {
    case "u":
      return 0
    case "r":
      return 90
    case "d":
      return 180
    case "l":
      return -90
    default:
      return 0
  }
}

export function Robot({
  row,
  col,
  direction,
  afterRow,
  afterCol,
  afterAngle,
  responsive,
  opacity = 1,
}: {
  row: number
  col: number
  direction: MissionValue
  afterRow?: number
  afterCol?: number
  afterAngle?: number
  responsive?: boolean
  opacity?: number
}) {
  const hasAfter =
    afterRow !== undefined && afterCol !== undefined && afterAngle !== undefined
  const [showAfter, setShowAfter] = useState(false)

  // Loop animation: toggle between before and after states
  useEffect(() => {
    if (!hasAfter) {
      setShowAfter(false)
      return
    }
    setShowAfter(false)
    let phase = false
    const interval = setInterval(() => {
      phase = !phase
      setShowAfter(phase)
    }, 1200)

    return () => {
      clearInterval(interval)
    }
  }, [hasAfter])

  const currentRow = hasAfter && showAfter ? afterRow : row
  const currentCol = hasAfter && showAfter ? afterCol : col
  const beforeDeg = dirToDeg(direction)
  const currentAngle = hasAfter && showAfter ? afterAngle : beforeDeg

  const botStyle: React.CSSProperties = responsive
    ? {
        position: "absolute",
        top: `calc(var(--cell-size) * ${currentRow})`,
        left: `calc(var(--cell-size) * ${currentCol})`,
        height: "var(--cell-size)",
        width: "var(--cell-size)",
        transition: "top 0.5s ease, left 0.5s ease, transform 0.5s ease",
        transform: `rotate(${currentAngle}deg)`,
        pointerEvents: "none",
        opacity,
      }
    : {
        position: "absolute",
        top: `${currentRow * PANEL_SIZE}px`,
        left: `${currentCol * PANEL_SIZE}px`,
        height: `${PANEL_SIZE}px`,
        width: `${PANEL_SIZE}px`,
        transition: "top 0.5s ease, left 0.5s ease, transform 0.5s ease",
        transform: `rotate(${currentAngle}deg)`,
        pointerEvents: "none",
        opacity,
      }

  return (
    <div style={botStyle}>
      <Image src="/robot.png" alt="bot" fill sizes={`${PANEL_SIZE}px`} />
    </div>
  )
}
