"use client"

import Link from "next/link"
import type React from "react"
import { useEffect, useState } from "react"
import { CommonCheckboxList } from "@/app/components/common/commonList"
import { CommonRegister } from "@/app/components/common/commonRegister"
import type {
  SelectCourseWithCompetition,
  SelectPlayer,
  SelectPlayerWithCompetition,
  SelectUmpire,
  SelectUmpireWithCompetition,
} from "@/app/lib/db/schema"

type PlayerProps = {
  type: "player"
  initialCommonDataList: SelectPlayerWithCompetition[]
}

type UmpireProps = {
  type: "umpire"
  initialCommonDataList: SelectUmpireWithCompetition[]
}

type CourseProps = {
  type: "course"
  initialCommonDataList: SelectCourseWithCompetition[]
}

export function View({
  type,
  initialCommonDataList,
}: PlayerProps | UmpireProps | CourseProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const commonString =
    type === "player" ? "選手" : type === "umpire" ? "採点者" : "コース"
  const [commonDataList, setCommonDataList] = useState<
    | SelectPlayerWithCompetition[]
    | SelectUmpireWithCompetition[]
    | SelectCourseWithCompetition[]
    | SelectPlayer[]
    | SelectUmpire[]
  >(initialCommonDataList)
  // 配列をクエリ文字列に変換する関数
  function createQueryParams(ids: number[] | null) {
    if (!ids || ids.length === 0) {
      return ""
    }
    return ids.map((id) => `${id}`).join("/")
  }

  useEffect(() => {
    setCommonDataList(commonDataList)
  }, [commonDataList])

  // 選択したitemに実施する行動の選択肢
  function ItemManager({ commonId }: { commonId: number[] | null }) {
    return (
      <>
        {successMessage && (
          <div className="text-green-500 font-semibold">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="text-red-500 font-semibold">{errorMessage}</div>
        )}
        <div className="flex w-fit">
          <p className="flex m-3">選択した{commonString}を</p>
          {type === "course" && (
            <Link
              href={`/course/edit/${createQueryParams(commonId)}`}
              className={`flex btn mx-auto m-3 ${
                commonId?.length !== 1
                  ? "pointer-events-none btn-disabled"
                  : "btn-primary"
              }`}
              aria-disabled={commonId?.length !== 1}
              tabIndex={commonId?.length !== 1 ? -1 : undefined}
              onClick={() => {
                setSuccessMessage(null)
              }}
            >
              編集
            </Link>
          )}
          <Link
            href={
              type === "player"
                ? `/player/assign/${createQueryParams(commonId)}`
                : type === "umpire"
                  ? `/umpire/assign/${createQueryParams(commonId)}`
                  : `/course/assign/${createQueryParams(commonId)}`
            }
            className={`flex btn mx-auto m-3 ml-5 ${
              commonId === null || commonId?.length === 0
                ? "pointer-events-none btn-disabled"
                : "btn-primary"
            }`}
            aria-disabled={commonId === null || commonId?.length === 0}
            tabIndex={
              commonId === null || commonId?.length === 0 ? -1 : undefined
            }
            onClick={() => setSuccessMessage(null)}
          >
            大会割当
          </Link>
          <Link
            href={
              type === "player"
                ? `/player/delete/${createQueryParams(commonId)}`
                : type === "umpire"
                  ? `/umpire/delete/${createQueryParams(commonId)}`
                  : `/course/delete/${createQueryParams(commonId)}`
            }
            className={`flex btn mx-auto m-3 ml-5 ${
              commonId === null || commonId?.length === 0
                ? "pointer-events-none btn-disabled"
                : "btn-warning"
            }`}
            aria-disabled={commonId === null || commonId?.length === 0}
            tabIndex={
              commonId === null || commonId?.length === 0 ? -1 : undefined
            }
            onClick={() => setSuccessMessage(null)}
          >
            削除
          </Link>
        </div>
      </>
    )
  }

  // 新規登録UIを持つView
  function ViewWithRegister() {
    const [commonId, setCommonId] = useState<number[] | null>(null)
    return (
      <div className="lg:flex lg:flex-row">
        <div className="flex-col lg:w-2/3">
          <CommonCheckboxList
            props={{ type: type, commonDataList: commonDataList }}
            commonId={commonId}
            setCommonId={setCommonId}
          />
          <ItemManager commonId={commonId} />
        </div>
        <div className="lg:w-1/3">
          <CommonRegister
            type={type}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
            setCommonDataList={
              setCommonDataList as React.Dispatch<
                React.SetStateAction<SelectPlayer[] | SelectUmpire[]>
              >
            }
          />
        </div>
      </div>
    )
  }

  // 新規登録UIを持たないView
  function ViewNoRegister() {
    const [commonId, setCommonId] = useState<number[] | null>(null)
    return (
      <>
        <CommonCheckboxList
          props={{ type: type, commonDataList: commonDataList }}
          commonId={commonId}
          setCommonId={setCommonId}
        />
        <ItemManager commonId={commonId} />
      </>
    )
  }

  return type === "player" || type === "umpire" ? (
    <ViewWithRegister />
  ) : (
    <ViewNoRegister />
  )
}
