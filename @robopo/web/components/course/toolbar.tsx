import type { ToolType } from "@/app/course/edit/courseEditContext"
import { isGoal, isStart } from "@/lib/course/field"
import type { FieldState } from "@/lib/course/types"

type ToolbarProps = {
  field: FieldState
  selectedTool: ToolType
  setSelectedTool: (tool: ToolType) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onClearAll: () => void
}

const tools: {
  value: ToolType
  label: string
  dot: string
  activeBg: string
  activeRing: string
}[] = [
  {
    value: "start",
    label: "スタート",
    dot: "bg-pink-400",
    activeBg: "bg-pink-300 text-pink-900",
    activeRing: "ring-pink-400",
  },
  {
    value: "route",
    label: "ルート",
    dot: "bg-blue-400",
    activeBg: "bg-blue-300 text-blue-900",
    activeRing: "ring-blue-400",
  },
  {
    value: "goal",
    label: "ゴール",
    dot: "bg-green-400",
    activeBg: "bg-green-300 text-green-900",
    activeRing: "ring-green-400",
  },
  {
    value: "eraser",
    label: "消去",
    dot: "bg-gray-400",
    activeBg: "bg-gray-300 text-gray-900",
    activeRing: "ring-gray-400",
  },
]

export function Toolbar({
  field,
  selectedTool,
  setSelectedTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearAll,
}: ToolbarProps) {
  function isDisabled(tool: ToolType): boolean {
    if (tool === "start") {
      return isStart(field)
    }
    if (tool === "goal") {
      return isGoal(field)
    }
    return false
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Tool selection - segmented control style */}
      <div className="flex gap-1 rounded-xl bg-base-200 p-1">
        {tools.map((t) => {
          const active = selectedTool === t.value
          const disabled = isDisabled(t.value)

          return (
            <button
              key={t.value}
              type="button"
              className={`flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-lg px-1.5 py-2 font-medium text-xs transition-all duration-150 sm:gap-1.5 sm:px-2 sm:text-sm ${
                active
                  ? `${t.activeBg} shadow-sm ring-2 ${t.activeRing} ring-offset-1`
                  : "bg-transparent text-base-content/70 hover:bg-base-100"
              } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
              disabled={disabled}
              onClick={() => setSelectedTool(t.value)}
            >
              <span
                className={`inline-block size-2.5 shrink-0 rounded-full sm:size-3 ${t.dot} ${
                  disabled ? "opacity-50" : ""
                }`}
              />
              <span className="whitespace-nowrap">{t.label}</span>
              {disabled && <span className="hidden text-xs sm:inline">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm min-h-[36px] min-w-[36px]"
          onClick={onUndo}
          disabled={!canUndo}
          title="元に戻す"
        >
          ↩
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm min-h-[36px] min-w-[36px]"
          onClick={onRedo}
          disabled={!canRedo}
          title="やり直す"
        >
          ↪
        </button>
        <div className="ml-auto">
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-[36px] text-error"
            onClick={() => {
              if (window.confirm("フィールドをすべてクリアしますか？")) {
                onClearAll()
              }
            }}
          >
            全クリア
          </button>
        </div>
      </div>
    </div>
  )
}
