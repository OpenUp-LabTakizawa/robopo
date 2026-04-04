import { afterEach, describe, expect, mock, test } from "bun:test"
import { cleanup, fireEvent, render } from "@testing-library/react"
import {
  CommonCheckboxList,
  CommonRadioList,
  CommonSelectionList,
} from "@/app/components/common/commonList"

afterEach(cleanup)

const players = [
  {
    id: 1,
    name: "Alice",
    furigana: "ありす",
    zekken: 10,
    qr: "",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Bob",
    furigana: "ぼぶ",
    zekken: 20,
    qr: "",
    createdAt: new Date(),
  },
]

const competitions = [
  { id: 1, name: "大会A", step: 0, createdAt: new Date() },
  { id: 2, name: "大会B", step: 1, createdAt: new Date() },
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
        props={{ type: "umpire", commonDataList: [] }}
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
