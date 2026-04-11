"use client"

import {
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import type React from "react"
import { useState } from "react"
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
  // Convert array to query string
  function createQueryParams(ids: number[] | null) {
    if (!ids || ids.length === 0) {
      return ""
    }
    return ids.map((id) => `${id}`).join("/")
  }

  // Action options for selected items
  function ItemManager({ commonId }: { commonId: number[] | null }) {
    return (
      <div className="px-4 pt-2 pb-4">
        {successMessage && (
          <div className="mb-3 rounded-lg bg-success/10 px-4 py-2 font-medium text-sm text-success">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-3 rounded-lg bg-error/10 px-4 py-2 font-medium text-error text-sm">
            {errorMessage}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {type !== "course" && (
            <span className="text-base-content/60 text-sm">
              選択した{commonString}を
            </span>
          )}
          {type === "course" && (
            <Link
              href={`/course/edit/${createQueryParams(commonId)}`}
              className={`btn btn-sm gap-1.5 rounded-lg ${
                commonId?.length !== 1
                  ? "btn-disabled pointer-events-none"
                  : "btn-primary btn-outline"
              }`}
              aria-disabled={commonId?.length !== 1}
              tabIndex={commonId?.length !== 1 ? -1 : undefined}
              onClick={() => {
                setSuccessMessage(null)
              }}
            >
              <PencilSquareIcon className="size-4" />
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
            className={`btn btn-sm gap-1.5 rounded-lg ${
              commonId === null || commonId?.length === 0
                ? "btn-disabled pointer-events-none"
                : "btn-primary btn-outline"
            }`}
            aria-disabled={commonId === null || commonId?.length === 0}
            tabIndex={
              commonId === null || commonId?.length === 0 ? -1 : undefined
            }
            onClick={() => setSuccessMessage(null)}
          >
            <LinkIcon className="size-4" />
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
            className={`btn btn-sm gap-1.5 rounded-lg ${
              commonId === null || commonId?.length === 0
                ? "btn-disabled pointer-events-none"
                : "btn-error btn-outline"
            }`}
            aria-disabled={commonId === null || commonId?.length === 0}
            tabIndex={
              commonId === null || commonId?.length === 0 ? -1 : undefined
            }
            onClick={() => setSuccessMessage(null)}
          >
            <TrashIcon className="size-4" />
            削除
          </Link>
        </div>
      </div>
    )
  }

  // View with registration UI
  function ViewWithRegister() {
    const [commonId, setCommonId] = useState<number[]>([])
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

  // View without registration UI (course)
  function ViewNoRegister() {
    const [commonId, setCommonId] = useState<number[]>([])
    return (
      <>
        <ItemManager commonId={commonId} />
        <CommonCheckboxList
          props={{ type: type, commonDataList: commonDataList }}
          commonId={commonId}
          setCommonId={setCommonId}
        />
      </>
    )
  }

  return type === "player" || type === "umpire" ? (
    <ViewWithRegister />
  ) : (
    <ViewNoRegister />
  )
}
