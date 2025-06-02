"use client"
import React, { useEffect, useState } from "react"

type ThreeTabsProps = {
  tab1Title: string
  tab1: React.JSX.Element
  tab1Icon?: React.JSX.Element
  tab2Title: string
  tab2: React.JSX.Element
  tab2Icon?: React.JSX.Element
  tab3Title: string
  tab3: React.JSX.Element
  tab3Icon?: React.JSX.Element
}

export const ThreeTabs = ({ tab1Title, tab1, tab1Icon, tab2Title, tab2, tab2Icon, tab3Title, tab3, tab3Icon }: ThreeTabsProps) => {
  const [threeCols, setThreeCols] = useState(false)
  useEffect(() => {
    // 768px以上のブレイクポイントに対応
    const mediaQuery768 = window.matchMedia("(min-width: 768px)")

    const updateItemsPerPage = () => {
      if (mediaQuery768.matches) {
        setThreeCols(true) // 768px以上では3行
      } else {
        setThreeCols(false) // 768px未満では1行
      }
    }

    // イベントリスナーの定義
    const handleMediaChange = () => {
      updateItemsPerPage()
    }

    // 各メディアクエリにリスナーを登録
    mediaQuery768.addEventListener("change", handleMediaChange)

    // 初期化時に適切な itemsPerPage を設定
    updateItemsPerPage()

    // クリーンアップ
    return () => {
      mediaQuery768.removeEventListener("change", handleMediaChange)
    }
  }, [])

  // タブのタイトルと内容を配列化
  const tabs = [
    { title: tab1Title, content: tab1, icon: tab1Icon || null },
    { title: tab2Title, content: tab2, icon: tab2Icon || null },
    { title: tab3Title, content: tab3, icon: tab3Icon || null },
  ]

  return (
    <>
      {/* 768px以上の場合は3行で表示 */}
      {threeCols && (
        <div className="flex flex-row justify-center w-full m-5">
          {tabs.map(({ title, content, icon }, idx) => (
            <div className="w-1/3" key={title}>
              <h1 className="flex flex-row text-2xl m-3">{icon}{title}</h1>
              {content}
            </div>
          ))}
        </div>
      )}

      {/* 768px未満の場合は1行で表示 */}
      {!threeCols && (
        <div role="tablist" className="tabs tabs-lifted m-5">
          {tabs.map(({ title, content, icon }, idx) => (
            <React.Fragment key={title}>
              <input
                type="radio"
                name="tabs"
                role="tab"
                id={"tab" + idx}
                className="tab whitespace-nowrap"
                aria-labelledby={"tab-label" + idx}
                defaultChecked={idx === 0}
              />
              <div role="tabpanel" className="tab-content bg-base-100 border border-base-300 rounded-box p-6">
                {content}
              </div>
              <label id={"tab-label" + idx} htmlFor={"tab" + idx} className="flex tab items-center">
                {icon}
                {title}
              </label>
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  )
}
