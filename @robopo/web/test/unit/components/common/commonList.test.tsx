import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, fireEvent, render } from "@testing-library/react"
import {
  CommonCheckboxList,
  CommonRadioList,
  CommonSelectionList,
} from "@/components/common/commonList"

afterEach(cleanup)

const players = [
  {
    id: 1,
    name: "Alice",
    furigana: "ありす",
    bibNumber: 10,
    qr: "",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Bob",
    furigana: "ぼぶ",
    bibNumber: 20,
    qr: "",
    createdAt: new Date(),
  },
]

const competitions = [
  {
    id: 1,
    name: "大会A",
    description: null,
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    courseIds: [],
    courseNames: [],
  },
  {
    id: 2,
    name: "大会B",
    description: null,
    startDate: null,
    endDate: null,
    createdAt: new Date(),
    courseIds: [],
    courseNames: [],
  },
]

describe("CommonSelectionList", () => {
  test("renders radio inputs when selectionMode is radio", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "player", commonDataList: players }}
        selectionMode="radio"
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    const radios = container.querySelectorAll('input[type="radio"]')
    // 1 disabled header + 2 rows
    expect(radios).toHaveLength(3)
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
  })

  test("renders checkbox inputs when selectionMode is checkbox", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "player", commonDataList: players }}
        selectionMode="checkbox"
        selectedId={[]}
        onSelect={onSelect}
      />,
    )
    const checkboxes = container.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(3)
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(0)
  })

  test("calls onSelect when row is clicked", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "player", commonDataList: players }}
        selectionMode="radio"
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    const rows = container.querySelectorAll("tbody tr")
    fireEvent.click(rows[0])
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  test("calls onSelect when Enter key is pressed on row", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "player", commonDataList: players }}
        selectionMode="radio"
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    const rows = container.querySelectorAll("tbody tr")
    fireEvent.keyDown(rows[0], { key: "Enter" })
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  test("calls onSelect when Space key is pressed on row", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "player", commonDataList: players }}
        selectionMode="radio"
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    const rows = container.querySelectorAll("tbody tr")
    fireEvent.keyDown(rows[0], { key: " " })
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  test("shows empty message when list is empty", () => {
    const onSelect = mock()
    const { getByText } = render(
      <CommonSelectionList
        props={{ type: "judge", commonDataList: [] }}
        selectionMode="radio"
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    expect(getByText("採点者が登録されていません。")).toBeTruthy()
  })

  test("radio checks the selected item", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "competition", commonDataList: competitions }}
        selectionMode="radio"
        selectedId={2}
        onSelect={onSelect}
      />,
    )
    const radios = container.querySelectorAll<HTMLInputElement>(
      'tbody input[type="radio"]',
    )
    expect(radios[0].checked).toBe(false)
    expect(radios[1].checked).toBe(true)
  })

  test("checkbox checks selected items", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "player", commonDataList: players }}
        selectionMode="checkbox"
        selectedId={[1, 2]}
        onSelect={onSelect}
      />,
    )
    const boxes = container.querySelectorAll<HTMLInputElement>(
      'tbody input[type="checkbox"]',
    )
    expect(boxes[0].checked).toBe(true)
    expect(boxes[1].checked).toBe(true)
  })
})

describe("CommonRadioList", () => {
  test("delegates to CommonSelectionList with radio mode", () => {
    const setCommonId = mock()
    const { container } = render(
      <CommonRadioList
        props={{ type: "player", commonDataList: players }}
        commonId={null}
        setCommonId={setCommonId}
      />,
    )
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(3)

    const rows = container.querySelectorAll("tbody tr")
    fireEvent.click(rows[0])
    expect(setCommonId).toHaveBeenCalledWith(1)
  })
})

describe("CommonCheckboxList", () => {
  test("toggles selection on click", () => {
    let ids: number[] = [1]
    const setCommonId = mock(
      (updater: number[] | ((prev: number[]) => number[])) => {
        ids = typeof updater === "function" ? updater(ids) : updater
      },
    )
    const { container } = render(
      <CommonCheckboxList
        props={{ type: "player", commonDataList: players }}
        commonId={ids}
        setCommonId={setCommonId}
      />,
    )
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(3)

    // Click row for id=2 → add
    const rows = container.querySelectorAll("tbody tr")
    fireEvent.click(rows[1])
    expect(setCommonId).toHaveBeenCalled()
    // The callback should have added id 2
    const lastCall = setCommonId.mock.calls[setCommonId.mock.calls.length - 1]
    expect(lastCall[0]).toEqual([1, 2])
  })
})

describe("Competition table columns", () => {
  test("renders correct header labels for competition type", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "competition", commonDataList: competitions }}
        selectionMode="checkbox"
        selectedId={[]}
        onSelect={onSelect}
      />,
    )
    const headers = container.querySelectorAll("thead th")
    const headerTexts = Array.from(headers).map((h) => h.textContent?.trim())
    expect(headerTexts).toContain("ID")
    expect(headerTexts).toContain("名前")
    expect(headerTexts).toContain("コース")
    expect(headerTexts).toContain("説明")
    expect(headerTexts).toContain("開催日")
    expect(headerTexts).toContain("終了日")
  })

  test("renders dash for null description, startDate, and endDate", () => {
    const onSelect = mock()
    const { container } = render(
      <CommonSelectionList
        props={{ type: "competition", commonDataList: competitions }}
        selectionMode="radio"
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    const cells = container.querySelectorAll("tbody tr:first-child td")
    const cellTexts = Array.from(cells).map((c) => c.textContent?.trim())
    // courses, description, startDate, endDate should all be "-"
    expect(cellTexts.filter((t) => t === "-")).toHaveLength(4)
  })

  test("renders formatted dates for non-null startDate and endDate", () => {
    const onSelect = mock()
    const competitionsWithDates = [
      {
        id: 1,
        name: "日付あり大会",
        description: "テスト説明",
        startDate: new Date("2026-04-01T00:00:00"),
        endDate: new Date("2026-04-30T00:00:00"),
        createdAt: new Date(),
        courseIds: [1],
        courseNames: ["テストコース"],
      },
    ]
    const { container } = render(
      <CommonSelectionList
        props={{
          type: "competition",
          commonDataList: competitionsWithDates,
        }}
        selectionMode="radio"
        selectedId={null}
        onSelect={onSelect}
      />,
    )
    const cells = container.querySelectorAll("tbody tr:first-child td")
    const cellTexts = Array.from(cells).map((c) => c.textContent?.trim())
    // description should render
    expect(cellTexts).toContain("テスト説明")
    // dates should not be "-"
    const dashCount = cellTexts.filter((t) => t === "-").length
    expect(dashCount).toBe(0)
    // dates should not contain ISO format "T" separator
    for (const text of cellTexts) {
      expect(text).not.toContain("T00:00:00")
    }
  })
})
