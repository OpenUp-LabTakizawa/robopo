import {
  PanelString,
  type PanelValue,
  getPanelHeight,
  getPanelWidth,
} from "@/app/components/course/utils"

type PanelProps = {
  value: PanelValue
  type?: string
  onClick: () => void
}

// Panelを表すコンポーネント
export const Panel = ({ value, type, onClick }: PanelProps) => {
  const panelStyle = `flex justify-center items-center w-10 h-10 border border-gray-800`
  const routeStyle = `${value === "start" ? "bg-pink-300" : value === "goal" ? "bg-green-300" : "bg-blue-300"} `
  const textStyle = type === "ipponBashi" ? " text-[10px] " : " text-lg "
  const hasRole = value === "start" || value === "goal" || value === "route"

  const panelWidth = getPanelWidth(type)
  const panelHeight = getPanelHeight(type)

  return (
    <div
      onClick={onClick}
      className={`${panelStyle} bg-white`}
      style={{ width: `${panelWidth}` + "px", height: `${panelHeight}` + "px" }}
    >
      {hasRole && (
        <div
          className={
            routeStyle +
            textStyle +
            " flex justify-center items-center font-bold rounded-sm"
          }
          style={{
            width: `${panelWidth - 10}` + "px",
            height: `${panelWidth - 10}` + "px",
          }}
        >
          {PanelString[value]}
        </div>
      )}
    </div>
  )
}
