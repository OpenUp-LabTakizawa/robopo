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
        <label className="cursor-pointer label justify-start">
          <input
            type="radio"
            name="mode"
            className="radio checked:bg-red-500 mr-2"
            value="start"
            onChange={handleChange}
            disabled={isStart(field)}
          />
          <span className="label-text">Start</span>
        </label>
      </div>
      <div className="form-control">
        <label className="cursor-pointer label justify-start">
          <input
            type="radio"
            name="mode"
            className="radio checked:bg-blue-500 mr-2"
            value="route"
            onChange={handleChange}
            disabled={!isStart(field)}
          />
          <span className="label-text">Route</span>
        </label>
      </div>
      <div className="form-control">
        <label className="cursor-pointer label justify-start">
          <input
            type="radio"
            name="mode"
            className="radio checked:bg-green-500 mr-2"
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
