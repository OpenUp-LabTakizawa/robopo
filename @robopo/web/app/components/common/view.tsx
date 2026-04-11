"use client"

import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
  FunnelIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import type React from "react"
import { useMemo, useState } from "react"
import { CommonCheckboxList } from "@/app/components/common/commonList"
import { CommonRegister } from "@/app/components/common/commonRegister"
import type {
  SelectCourseWithCompetition,
  SelectPlayer,
  SelectPlayerWithCompetition,
  SelectUmpire,
  SelectUmpireWithCompetition,
} from "@/app/lib/db/schema"

type SortKey = "createdAt" | "name" | "id"

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

  function CourseFilterBar({
    searchQuery,
    setSearchQuery,
    competitionFilter,
    setCompetitionFilter,
    competitionNames,
    sortKey,
    setSortKey,
    sortOrder,
    setSortOrder,
  }: {
    searchQuery: string
    setSearchQuery: (v: string) => void
    competitionFilter: string
    setCompetitionFilter: (v: string) => void
    competitionNames: string[]
    sortKey: SortKey
    setSortKey: (v: SortKey) => void
    sortOrder: "asc" | "desc"
    setSortOrder: React.Dispatch<React.SetStateAction<"asc" | "desc">>
  }) {
    return (
      <div className="flex flex-col gap-3 px-4 pb-4">
        <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-base-content/40" />
          <input
            type="text"
            placeholder="コース名・説明で検索"
            className="grow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5">
            <FunnelIcon className="size-3.5 shrink-0 text-base-content/40" />
            <span className="shrink-0 text-xs">大会</span>
            <select
              className="select select-ghost select-xs bg-transparent pe-0 font-medium focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
              style={{ backgroundImage: "none" }}
              value={competitionFilter}
              onChange={(e) => setCompetitionFilter(e.target.value)}
            >
              <option value="">すべて</option>
              {competitionNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-base-200/50 px-2.5 py-1.5">
            <select
              className="select select-ghost select-xs bg-transparent font-medium focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="createdAt">作成日時</option>
              <option value="name">コース名</option>
              <option value="id">ID</option>
            </select>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-md bg-base-100 px-2 py-1 text-xs shadow-sm transition-colors hover:bg-base-300/40"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              {sortOrder === "desc" ? (
                <BarsArrowDownIcon className="size-3.5" />
              ) : (
                <BarsArrowUpIcon className="size-3.5" />
              )}
              {sortKey === "createdAt"
                ? sortOrder === "desc"
                  ? "新しい順"
                  : "古い順"
                : sortKey === "name"
                  ? sortOrder === "desc"
                    ? "Z→A"
                    : "A→Z"
                  : sortOrder === "desc"
                    ? "大きい順"
                    : "小さい順"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // View without registration UI (course)
  function ViewNoRegister() {
    const [commonId, setCommonId] = useState<number[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [sortKey, setSortKey] = useState<SortKey>("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [competitionFilter, setCompetitionFilter] = useState("")

    const competitionNames = useMemo(() => {
      const names = new Set<string>()
      for (const c of commonDataList as SelectCourseWithCompetition[]) {
        for (const name of c.competitionName ?? []) {
          names.add(name)
        }
      }
      return [...names].sort((a, b) => a.localeCompare(b, "ja"))
    }, [])

    const filteredAndSortedList = useMemo(() => {
      let list = commonDataList as SelectCourseWithCompetition[]
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        list = list.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.description?.toLowerCase().includes(q) ?? false),
        )
      }
      if (competitionFilter) {
        list = list.filter((c) =>
          c.competitionName?.includes(competitionFilter),
        )
      }
      return [...list].sort((a, b) => {
        let cmp = 0
        if (sortKey === "name") {
          cmp = a.name.localeCompare(b.name, "ja")
        } else if (sortKey === "createdAt") {
          cmp = (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
        } else {
          cmp = a.id - b.id
        }
        return sortOrder === "asc" ? cmp : -cmp
      })
    }, [searchQuery, sortKey, sortOrder, competitionFilter])

    return (
      <>
        <ItemManager commonId={commonId} />
        <CourseFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          competitionFilter={competitionFilter}
          setCompetitionFilter={setCompetitionFilter}
          competitionNames={competitionNames}
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        {(searchQuery || competitionFilter) &&
        filteredAndSortedList.length === 0 ? (
          <div className="py-8 text-center text-base-content/40">
            条件に一致するコースが見つかりません
          </div>
        ) : (
          <CommonCheckboxList
            props={{ type: type, commonDataList: filteredAndSortedList }}
            commonId={commonId}
            setCommonId={setCommonId}
          />
        )}
      </>
    )
  }

  return type === "player" || type === "umpire" ? (
    <ViewWithRegister />
  ) : (
    <ViewNoRegister />
  )
}
