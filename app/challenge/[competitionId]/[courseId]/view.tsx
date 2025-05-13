"use client"
import { useState } from "react"
import Link from "next/link"
import { type SelectCourse, type SelectPlayer } from "@/app/lib/db/schema"
import { CommonRadioList } from "@/app/components/common/commonList"

type ViewProps = {
  courseData: SelectCourse
  initialPlayerDataList: { players: SelectPlayer[] }
  competitionId: number
  courseId: number
}

export const View = ({ courseData, initialPlayerDataList, competitionId, courseId }: ViewProps) => {
  const [playerId, setPlayerId] = useState<number | null>(null)
  const playerDataList = initialPlayerDataList.players
  const disableCondiion = !competitionId || !courseId || !playerId

  return (
    <div className="flex flex-col justify-center items-center overflow-y-auto w-full">
      <div className="w-full" >
        <h2 className="text-xl ml-5 self-start">選択中コース名:</h2>
      </div>
      <h2 className="text-xl">{courseData.name}</h2>
      <CommonRadioList
        props={{ type: "player", commonDataList: playerDataList }}
        commonId={playerId}
        setCommonId={setPlayerId}
      />
      <Link
        href={`/challenge/${competitionId}/${courseId}/${playerId}`}
        className={"btn min-w-28 max-w-fit mx-auto mt-5" + (disableCondiion ? " btn-disabled" : " btn-primary")}>
        確認へ
      </Link>
      <button
        type="button"
        className="btn btn-primary min-w-28 max-w-fit mx-auto mt-5"
        onClick={() => window.location.reload()}>
        再読み込み
      </button>
      <Link href="/" className="btn btn-primary min-w-28 max-w-fit mx-auto mt-5">
        トップへ戻る
      </Link>
    </div>
  )
}
