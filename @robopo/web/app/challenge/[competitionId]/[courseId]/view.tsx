"use client"

import { PlayIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useState } from "react"
import { CommonRadioList } from "@/app/components/common/commonList"
import { HomeButton, ReloadButton } from "@/app/components/parts/buttons"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export function View({
  courseData,
  initialPlayerDataList,
  competitionId,
  courseId,
}: {
  courseData: SelectCourse
  initialPlayerDataList: { players: SelectPlayer[] }
  competitionId: number
  courseId: number
}) {
  const [playerId, setPlayerId] = useState<number | null>(null)
  const playerDataList = initialPlayerDataList.players
  const disableCondition = !(competitionId && courseId && playerId)

  return (
    <div className="flex w-full flex-col items-center justify-center overflow-y-auto">
      <div className="flex w-full">
        <h2 className="ml-5 self-start text-xl">選択中コース名:</h2>
        <h2 className="text-xl">{courseData.name}</h2>
      </div>
      <CommonRadioList
        props={{ type: "player", commonDataList: playerDataList }}
        commonId={playerId}
        setCommonId={setPlayerId}
      />
      <Link
        href={`/challenge/${competitionId}/${courseId}/${playerId}`}
        className={`btn mx-auto mt-5 min-w-28 max-w-fit ${disableCondition ? "btn-disabled" : "btn-primary"}`}
      >
        <PlayIcon className="size-6" />
        確認へ
      </Link>
      <ReloadButton />
      <HomeButton />
    </div>
  )
}
