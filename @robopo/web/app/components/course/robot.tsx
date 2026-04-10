import Image from "next/image"
import { type MissionValue, PANEL_SIZE } from "@/app/components/course/utils"

export function Robot({
  row,
  col,
  direction,
}: {
  row: number
  col: number
  direction: MissionValue
}) {
  function rotationAngle(dir: MissionValue) {
    switch (dir) {
      case "u":
        return "rotate(0deg)"
      case "r":
        return "rotate(90deg)"
      case "d":
        return "rotate(180deg)"
      case "l":
        return "rotate(-90deg)"
      default:
        return "rotate(0deg)"
    }
  }

  const botStyle: React.CSSProperties = {
    position: "absolute",
    top: `${row * PANEL_SIZE}px`,
    left: `${col * PANEL_SIZE}px`,
    height: `${PANEL_SIZE}px`,
    width: `${PANEL_SIZE}px`,
    transition: "top 0.5s ease, left 0.5s ease, transform 0.5s ease",
    transform: rotationAngle(direction),
    pointerEvents: "none",
  }

  return (
    <div style={botStyle}>
      <Image src="/robot.png" alt="bot" fill sizes={`${PANEL_SIZE}px`} />
    </div>
  )
}
