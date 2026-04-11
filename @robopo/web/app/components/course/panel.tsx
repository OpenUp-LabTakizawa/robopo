import { PanelString, type PanelValue } from "@/app/components/course/utils"

// Panel component
export function Panel({
  value,
  isEditMode,
  panelNumber,
  onClick,
  onPointerDown,
  onPointerEnter,
}: {
  value: PanelValue
  isEditMode?: boolean
  panelNumber?: number
  onClick: () => void
  onPointerDown?: () => void
  onPointerEnter?: () => void
}) {
  const routeStyle =
    value === "start"
      ? "bg-pink-300"
      : value === "goal"
        ? "bg-green-300"
        : "bg-blue-300"
  const hasRole =
    value === "start" ||
    value === "goal" ||
    value === "route" ||
    value === "startGoal"

  // Empty cell styling in edit mode
  const emptyStyle =
    isEditMode && !hasRole
      ? "border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
      : "border-gray-800 bg-white"

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      className={`relative flex aspect-square w-full flex-col items-center justify-center border ${
        hasRole ? "border-gray-800 bg-white" : emptyStyle
      }`}
    >
      {panelNumber !== undefined && (
        <span className="pointer-events-none absolute top-0.5 left-0.5 font-mono text-[9px] text-gray-500 leading-none">
          P{panelNumber}
        </span>
      )}
      {hasRole &&
        (value === "startGoal" ? (
          <>
            <div className="flex h-[34%] w-[68%] items-center justify-center whitespace-nowrap rounded-t-sm bg-pink-300 font-bold text-[10px] sm:text-sm">
              {PanelString.start}
            </div>
            <div className="flex h-[34%] w-[68%] items-center justify-center whitespace-nowrap rounded-b-sm bg-green-300 font-bold text-[10px] sm:text-sm">
              {PanelString.goal}
            </div>
          </>
        ) : (
          <div
            className={`${routeStyle} flex h-[68%] w-[68%] items-center justify-center whitespace-nowrap rounded-sm font-bold text-[10px] sm:text-sm`}
          >
            {PanelString[value]}
          </div>
        ))}
    </button>
  )
}
