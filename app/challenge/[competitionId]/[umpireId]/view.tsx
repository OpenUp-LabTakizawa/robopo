"use client"
import { useState } from "react"
import { type SelectCourse, type SelectPlayer } from "@/app/lib/db/schema"
import { CommonRadioList } from "@/app/components/common/commonList"
import Link from "next/link"

type ViewProps = {
  courseData: SelectCourse
  initialPlayerDataList: { players: SelectPlayer[] }
  competitionId: number
  umpireId: number
}

export const View = ({ initialPlayerDataList, competitionId, umpireId }: ViewProps) => {
  const [playerId, setPlayerId] = useState<number | null>(null)
  const playerDataList = initialPlayerDataList.players
  const disableCondiion = !competitionId || !umpireId || !playerId

  return (
    <div className="flex flex-col justify-center items-center overflow-y-auto w-full pt-10">
      <CommonRadioList
        props={{ type: "player", commonDataList: playerDataList }}
        commonId={playerId}
        setCommonId={setPlayerId}
      />
      <Link
        href={`/challenge/${competitionId}/${umpireId}/${playerId}`}
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
