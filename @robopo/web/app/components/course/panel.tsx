import {
  getPanelHeight,
  getPanelWidth,
  PanelString,
  type PanelValue,
} from "@/app/components/course/utils"

// Panelを表すコンポーネント
export function Panel({
  value,
  type,
  onClick,
}: {
  value: PanelValue
  type?: string
  onClick: () => void
}) {
  const routeStyle = `${value === "start" ? "bg-pink-300" : value === "goal" ? "bg-green-300" : "bg-blue-300"} `
  const textStyle = type === "ipponBashi" ? " text-[10px] " : " text-lg "
  const hasRole = value === "start" || value === "goal" || value === "route"

  const panelWidth = getPanelWidth(type)
  const panelHeight = getPanelHeight(type)

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center border border-gray-800 bg-white"
      style={{ width: `${panelWidth}px`, height: `${panelHeight}px` }}
    >
      {hasRole && (
        <div
          className={
            routeStyle +
            textStyle +
            " flex items-center justify-center rounded-sm font-bold"
          }
          style={{
            width: `${panelWidth - 10}px`,
            height: `${panelWidth - 10}px`,
          }}
        >
          {PanelString[value]}
        </div>
      )}
    </button>
  )
}
