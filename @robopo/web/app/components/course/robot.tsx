import Image from "next/image"
import {
  getPanelHeight,
  getPanelWidth,
  type MissionValue,
} from "@/app/components/course/utils"

export function Robot({
  row,
  col,
  direction,
  type,
}: {
  row: number
  col: number
  direction: MissionValue
  type?: string
}) {
  const panelWidth = getPanelWidth(type)
  const panelHeight = getPanelHeight(type)
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
    top: `${row * panelHeight}px`,
    left: `${col * panelWidth}px`,
    height: `${panelHeight}px`,
    width: `${panelWidth}px`,
    transition: "top 0.5s ease, left 0.5s ease, transform 0.5s ease",
    transform: rotationAngle(direction),
    pointerEvents: "none",
  }

  return (
    <div style={botStyle}>
      <Image src="/robot.png" alt="bot" fill sizes="100vw" />
    </div>
  )
}
