import { useState } from "react"
import { MissionList } from "@/app/components/course/missionList"
import { MissionUI } from "@/app/components/course/missionUI"
import type {
  MissionState,
  MissionValue,
  PointState,
  PointValue,
} from "@/app/components/course/utils"

type MissionEditProps = {
  mission: MissionState
  setMission: React.Dispatch<React.SetStateAction<MissionState>>
  point: PointState
  setPoint: React.Dispatch<React.SetStateAction<PointState>>
}

export default function MissionEdit({
  mission,
  setMission,
  point,
  setPoint,
}: MissionEditProps) {
  const [radio, setRadio] = useState<number | null>(null)
  const [selectedMission, setSelectedMission] = useState<MissionValue | null>(
    null,
  )
  const [selectedParam, setSelectedParam] = useState<number | null>(null) // 選択されたミッションのパラメータ
  const [selectedPoint, setSelectedPoint] = useState<PointValue | null>(null)
  const [addOrder, setAddOrder] = useState<number>(-1)

  function handleRadioChange(selectedIndex: number) {
    setRadio(selectedIndex) // 選択されたインデックスを状態として保存
    setSelectedMission(null) // 選択されたミッションをリセット
    setSelectedParam(null) // 選択されたパラメータをリセット
    setSelectedPoint(null) // 選択されたポイントをリセット
  }
  // ラジオボタンを押した時の動作
  // ラジオボタン value=0以上の整数 はmissionの順番
  // ラジオボタン value=-1 はmissionが設定されていない
  // ラジオボタン value=-2 はStart
  // ラジオボタン value=-3 はGoal

  return (
    <div className="container mx-auto">
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <MissionList
            mission={mission}
            point={point}
            radio={radio}
            handleRadioChange={handleRadioChange}
            addOrder={addOrder}
            setAddOrder={setAddOrder}
          />
        </div>
      </div>
      <div className="card w-full min-w-72 bg-base-100 shadow-xl">
        <div className="card-body">
          <MissionUI
            mission={mission}
            setMission={setMission}
            point={point}
            radio={radio}
            setPoint={setPoint}
            selectedId={radio === -1 ? addOrder : radio}
            selectedMission={selectedMission}
            setSelectedMission={setSelectedMission}
            selectedParam={selectedParam}
            setSelectedParam={setSelectedParam}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            setRadio={setRadio}
            setAddOrder={setAddOrder}
          />
        </div>
      </div>
    </div>
  )
}
