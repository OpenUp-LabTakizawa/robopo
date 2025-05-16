"use client"

import React, { useState, useEffect } from "react"
import { MissionValue, MissionString, PointValue, panelOrDegree } from "@/app/components/course/utils"
import { isCompletedCourse } from "@/app/components/summary/utils"
import { calcPoint } from "@/app/components/challenge/utils"

type TCourseTableProps = {
  missionPair: MissionValue[][]
  point: PointValue[]
  resultArray: { results1: number; results2: number | null }[]
  firstTCourseCount: { firstCount: number }[]
  maxResult: { maxResult: number }[]
}

export const TCourseTable = ({ missionPair, point, resultArray, firstTCourseCount, maxResult }: TCourseTableProps) => {
  // 現在のタブを管理(最初は0ページ)
  const [currentTab, setCurrentTab] = useState(0)
  const [itemsPerTab, setItemsPerPage] = useState(5)

  useEffect(() => {
    // 640px以上、1024px以上のブレイクポイントに対応
    const mediaQuery640 = window.matchMedia("(min-width: 640px)")
    const mediaQuery1024 = window.matchMedia("(min-width: 1024px)")

    const updateItemsPerPage = () => {
      if (mediaQuery1024.matches) {
        setItemsPerPage(20) // 1024px以上では20列
      } else if (mediaQuery640.matches) {
        setItemsPerPage(10) // 640px以上では10列
      } else {
        setItemsPerPage(5) // 640px未満では5列
      }
    }

    // イベントリスナーの定義
    const handleMediaChange = () => {
      updateItemsPerPage()
    }

    // 各メディアクエリにリスナーを登録
    mediaQuery640.addEventListener("change", handleMediaChange)
    mediaQuery1024.addEventListener("change", handleMediaChange)

    // 初期化時に適切な itemsPerPage を設定
    updateItemsPerPage()

    // クリーンアップ
    return () => {
      mediaQuery640.removeEventListener("change", handleMediaChange)
      mediaQuery1024.removeEventListener("change", handleMediaChange)
    }
  }, [])

  // 総列数
  const totalColumns = resultArray.reduce((count, result) => {
    return count + (result.results1 !== null ? 1 : 0) + (result.results2 !== null ? 1 : 0)
  }, 0)

  const totalPages = Math.ceil(totalColumns / itemsPerTab)
  const startIndex = currentTab * itemsPerTab
  const endIndex = startIndex + itemsPerTab

  const visibleResults: { result: { results1: number; results2: number | null }; type: string }[] = []
  let columnCount = 0
  for (let i = 0; i < resultArray.length; i++) {
    if (columnCount >= startIndex && columnCount < endIndex) {
      visibleResults.push({ result: resultArray[i], type: "results1" })
    }
    columnCount++
    if (resultArray[i].results2 !== null) {
      if (columnCount >= startIndex && columnCount < endIndex) {
        visibleResults.push({ result: resultArray[i], type: "results2" })
      }
      columnCount++
    }
  }

  // タブ切り替えコンポーネント
  const tabSwitcher = () => {
    return (
      <div className="join">
        <button
          className="join-item btn btn-square"
          disabled={currentTab === 0}
          onClick={() => setCurrentTab(currentTab - 1)}>
          «
        </button>
        {Array.from({ length: totalPages }).map((_, index) => (
          <input
            key={index}
            className="join-item btn btn-square"
            type="radio"
            name="options"
            aria-label={(index + 1).toString()}
            checked={currentTab === index}
            onClick={() => setCurrentTab(index)}
            onChange={() => {}}
          />
        ))}
        <button
          className="join-item btn btn-square"
          disabled={currentTab === totalPages - 1}
          onClick={() => setCurrentTab(currentTab + 1)}>
          »
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="grid justify-center w-full">
        <table className="table table-pin-rows">
          <tbody>
            <tr>
              <td colSpan={3} className="border border-gray-400 p-2 text-center"></td>
              {visibleResults.map((_, index: number) => (
                <React.Fragment key={index}>
                  <td className="border border-gray-400 min-w-9 p-2 text-center">
                    {currentTab * itemsPerTab + index + 1}
                  </td>
                </React.Fragment>
              ))}
              {Array.from({ length: itemsPerTab - visibleResults.length }).map((_, index: number) => (
                <React.Fragment key={index}>
                  <td className="min-w-9"></td>
                </React.Fragment>
              ))}
            </tr>
            {missionPair.map((pair, index: number) => (
              <tr key={index}>
                <td className="border border-gray-400 p-2">{index + 1}</td>
                <th className="border border-gray-400 p-2">
                  {pair[0] !== null && MissionString[pair[0]]}
                  {pair[1] !== null && [pair[1]]}
                  {pair[0] !== null && panelOrDegree(pair[0])}
                </th>
                <td className="border border-gray-400 p-2">{point[index + 2]}</td>
                {visibleResults.map((result, visibleIndex: number) => (
                  <React.Fragment key={visibleIndex}>
                    <td className="border border-gray-400 min-w-9 p-2 text-center">
                      {result.type === "results1" && result.result.results1 > index ? "○" : ""}
                      {result.type === "results2" && result.result.results2! > index ? "○" : ""}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={2} className="border border-gray-400 p-2 text-center">
                Goal(六足)
              </td>
              <td className="border border-gray-400 p-2">{point[1]}</td>
              {visibleResults.map((result, index2: number) => (
                <React.Fragment key={index2}>
                  <td className="border border-gray-400 min-w-9 p-2 text-center">
                    {result.type === "results1" && isCompletedCourse(point, result.result.results1) ? "○" : ""}
                    {result.type === "results2" && isCompletedCourse(point, result.result.results2) ? "○" : ""}
                  </td>
                </React.Fragment>
              ))}
            </tr>
            <tr>
              <td colSpan={3} className="border bg-cyan-50 border-gray-400 min-w-9 p-2 text-center">
                コースポイント
              </td>
              {visibleResults.map((result, visibleIndex: number) => (
                <React.Fragment key={visibleIndex}>
                  <td className="border border-gray-400 min-w-9 p-2 text-center">
                    {result.type === "results1" && calcPoint(point, result.result.results1)}
                    {result.type === "results2" && calcPoint(point, result.result.results2)}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex w-full justify-center p-3">{tabSwitcher()}</div>
      <div className="grid justify-end m-3">
        <table className="table table-pin-rows">
          <tbody>
            <tr>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center">成功までの回数</td>
              <td className="border border-gray-400 p-2">
                {maxResult.length > 0 && isCompletedCourse(point, maxResult[0].maxResult)
                  ? firstTCourseCount[0].firstCount
                  : "-"}
              </td>
              <td className="border bg-cyan-50 border-gray-400 p-2 text-center">MAXポイント</td>
              <td className="border border-gray-400 p-2">
                {maxResult.length > 0 ? calcPoint(point, maxResult[0].maxResult) : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
