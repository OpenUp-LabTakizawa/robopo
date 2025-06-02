"use client"
import { useState } from "react"
import Link from "next/link"
import { PlayIcon } from "@heroicons/react/24/outline"
import { type SelectCourse, type SelectPlayer } from "@/app/lib/db/schema"
import { CommonRadioList } from "@/app/components/common/commonList"
import { ReloadButton, HomeButton } from "@/app/components/parts/buttons"

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
      <div className="w-full flex" >
        <h2 className="text-xl ml-5 self-start">選択中コース名:</h2>
        <h2 className="text-xl">{courseData.name}</h2>
      </div>
      <CommonRadioList
        props={{ type: "player", commonDataList: playerDataList }}
        commonId={playerId}
        setCommonId={setPlayerId}
      />
      <Link
        href={`/challenge/${competitionId}/${courseId}/${playerId}`}
        className={"btn min-w-28 max-w-fit mx-auto mt-5" + (disableCondiion ? " btn-disabled" : " btn-primary")}>
        <PlayIcon className="w-6 h-6" />
        確認へ
      </Link>
      <ReloadButton />
      <HomeButton />
    </div>
  )
}
