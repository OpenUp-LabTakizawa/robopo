"use client"
import { useState, useEffect } from "react"
import type { SelectPlayer, SelectUmpire, SelectPlayerWithCompetition, SelectUmpireWithCompetition } from "@/app/lib/db/schema"
import { CommonCheckboxList } from "@/app/components/common/commonList"
import CommonRegister from "@/app/components/common/commonRegister"
import Link from "next/link"

type PlayerProps = {
  type: "player"
  initialCommonDataList: SelectPlayerWithCompetition[]
}

type UmpireProps = {
  type: "umpire"
  initialCommonDataList: SelectUmpireWithCompetition[]
}

type ViewProps = PlayerProps | UmpireProps

export const View = ({ type, initialCommonDataList }: ViewProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [commonId, setCommonId] = useState<number[] | null>(null)
  const commonString = type === "player" ? "選手" : "採点者"
  const [commonDataList, setCommonDataList] = useState<SelectPlayerWithCompetition[] | SelectUmpireWithCompetition[] | SelectPlayer[] | SelectUmpire[]>(
    initialCommonDataList
  )

  useEffect(() => {
    setCommonDataList(commonDataList)
  }, [commonDataList])

  const DefaultView = () => {
    // 配列をクエリ文字列に変換する関数
    const createQueryParams = (ids: number[] | null) => {
      if (!ids || ids.length === 0) return ""
      return ids.map((id) => `${id}`).join("/")
    }

    return (
      <div className="lg:flex lg:flex-row">
        <div className="flex-col lg:w-2/3">
          <CommonCheckboxList
            props={{ type: type, commonDataList: commonDataList }}
            commonId={commonId}
            setCommonId={setCommonId}
          />
          {successMessage && <div className="text-green-500 font-semibold">{successMessage}</div>}

          {errorMessage && <div className="text-red-500 font-semibold">{errorMessage}</div>}

          <div className="flex w-fit">
            <p className="flex m-3">選択した{commonString}を</p>
            <Link
              href={
                type === "player"
                  ? `/player/delete/${createQueryParams(commonId)}`
                  : `/umpire/delete/${createQueryParams(commonId)}`
              }
              className={
                "flex btn mx-auto m-3 " +
                (commonId === null || commonId?.length === 0 ? "pointer-events-none btn-disabled" : "btn-primary")
              }
              aria-disabled={commonId === null || commonId?.length === 0}
              tabIndex={commonId === null || commonId?.length === 0 ? -1 : undefined}
              onClick={() => {
                setSuccessMessage(null)
              }}>
              削除
            </Link>
            <Link
              href={
                type === "player"
                  ? `/player/assign/${createQueryParams(commonId)}`
                  : `/umpire/assign/${createQueryParams(commonId)}`
              }
              className={
                "flex btn mx-auto m-3 ml-5 " +
                (commonId === null || commonId?.length === 0 ? "pointer-events-none btn-disabled" : "btn-primary")
              }
              aria-disabled={commonId === null || commonId?.length === 0}
              tabIndex={commonId === null || commonId?.length === 0 ? -1 : undefined}
              onClick={() => {
                setSuccessMessage(null)
              }}>
              大会割当
            </Link>
          </div>
        </div>
        <div className="lg:w-1/3">
          <CommonRegister
            type={type}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
            setCommonDataList={
              setCommonDataList as React.Dispatch<React.SetStateAction<SelectPlayer[] | SelectUmpire[]>>
            }
          />
        </div>
      </div>
    )
  }

  return <DefaultView />
}
