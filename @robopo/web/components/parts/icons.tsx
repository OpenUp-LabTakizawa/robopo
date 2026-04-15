import { SendHorizontal, Undo2 } from "lucide-react"
import type { JSX } from "react"

const BACK_CONST = {
  label: "戻る",
  icon: <Undo2 className="size-6" />,
}

export function BackLabelWithIcon(): JSX.Element {
  return (
    <>
      {BACK_CONST.icon}
      {BACK_CONST.label}
    </>
  )
}

export function SendIcon(): JSX.Element {
  return <SendHorizontal className="size-6" />
}
