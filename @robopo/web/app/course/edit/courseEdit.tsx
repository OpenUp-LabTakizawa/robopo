import { useState } from "react"
import { Field } from "@/app/components/course/field"
import { SelectPanel } from "@/app/components/course/selectPanel"
import {
  type FieldState,
  type PanelValue,
  putPanel,
} from "@/app/components/course/utils"

type CourseEditProps = {
  field: FieldState
  setField: React.Dispatch<React.SetStateAction<FieldState>>
}
export default function CourseEdit({ field, setField }: CourseEditProps) {
  const [mode, setMode] = useState<PanelValue>(null)

  function handlePanelClick(row: number, col: number) {
    // panelが置けるかどうかをチェック
    const newField = putPanel(field, row, col, mode)
    // panelを置けた場合
    if (newField) {
      setField(newField)
    }
  }

  return (
    <div className="container mx-auto">
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <p>CourseEdit</p>
          <Field type="edit" field={field} onPanelClick={handlePanelClick} />
        </div>
      </div>
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <SelectPanel field={field} setmode={setMode} />
        </div>
      </div>
    </div>
  )
}
