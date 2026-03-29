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
  tab3: React.JSX.Element | null
  tab3Icon?: React.JSX.Element
}

export function ThreeTabs({
  tab1Title,
  tab1,
  tab1Icon,
  tab2Title,
  tab2,
  tab2Icon,
  tab3Title,
  tab3,
  tab3Icon,
}: ThreeTabsProps) {
  const [threeCols, setThreeCols] = useState(false)
  useEffect(() => {
    // Handle breakpoint for 768px+
    const mediaQuery768 = window.matchMedia("(min-width: 768px)")

    function updateItemsPerPage() {
      if (mediaQuery768.matches) {
        setThreeCols(true) // 3 columns for 768px+
      } else {
        setThreeCols(false) // 1 row for below 768px
      }
    }

    // Register listener for media query
    mediaQuery768.addEventListener("change", updateItemsPerPage)

    // Set appropriate value on initialization
    updateItemsPerPage()

    // Cleanup
    return () => {
      mediaQuery768.removeEventListener("change", updateItemsPerPage)
    }
  }, [])

  // Convert tab titles and contents to array
  const tabs = [
    { title: tab1Title, content: tab1, icon: tab1Icon || null },
    { title: tab2Title, content: tab2, icon: tab2Icon || null },
    { title: tab3Title, content: tab3, icon: tab3Icon || null },
  ]

  return (
    <>
      {/* Display in 3 columns for 768px+ */}
      {threeCols && (
        <div className="m-5 flex w-full flex-row justify-center">
          {tabs.map(({ title, content, icon }) => (
            <div className="w-1/3" key={title}>
              <h1 className="m-3 flex flex-row text-2xl">
                {icon}
                {title}
              </h1>
              {content}
            </div>
          ))}
        </div>
      )}

      {/* Display in 1 row for below 768px */}
      {!threeCols && (
        <div role="tablist" className="tabs tabs-lifted m-5">
          {tabs.map(({ title, content, icon }, idx) => (
            <React.Fragment key={title}>
              <input
                type="radio"
                name="tabs"
                role="tab"
                id={`tab${idx}`}
                className="tab whitespace-nowrap"
                aria-labelledby={`tab-label${idx}`}
                defaultChecked={idx === 0}
              />
              <div
                role="tabpanel"
                className="tab-content rounded-box border border-base-300 bg-base-100 p-6"
              >
                {content}
              </div>
              <label
                id={`tab-label${idx}`}
                htmlFor={`tab${idx}`}
                className="tab flex items-center"
              >
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
