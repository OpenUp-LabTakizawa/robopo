import {
  type FieldState,
  isGoal,
  isStart,
  type PanelValue,
} from "@/app/components/course/utils"

// 配置するpanelのモード選択UI
export function SelectPanel({
  field,
  setmode,
}: {
  field: FieldState
  setmode: (mode: PanelValue) => void
}) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setmode(event.target.value as PanelValue)
  }

  return (
    <form>
      <div className="form-control">
        <label className="label cursor-pointer justify-start">
          <input
            type="radio"
            name="mode"
            className="radio mr-2 checked:bg-red-500"
            value="start"
            onChange={handleChange}
            disabled={isStart(field)}
          />
          <span className="label-text">Start</span>
        </label>
      </div>
      <div className="form-control">
        <label className="label cursor-pointer justify-start">
          <input
            type="radio"
            name="mode"
            className="radio mr-2 checked:bg-blue-500"
            value="route"
            onChange={handleChange}
            disabled={!isStart(field)}
          />
          <span className="label-text">Route</span>
        </label>
      </div>
      <div className="form-control">
        <label className="label cursor-pointer justify-start">
          <input
            type="radio"
            name="mode"
            className="radio mr-2 checked:bg-green-500"
            value="goal"
            onChange={handleChange}
            disabled={!isStart(field) || isGoal(field)}
          />
          <span className="label-text">Goal</span>
        </label>
      </div>
    </form>
  )
}
