import { describe, expect, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import {
  NavigationGuardProvider,
  useNavigationGuard,
} from "@/hooks/useNavigationGuard"

const wrapper = ({ children }: { children: ReactNode }) => (
  <NavigationGuardProvider>{children}</NavigationGuardProvider>
)

function fireBeforeUnload(): boolean {
  const event = new Event("beforeunload", { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

describe("useNavigationGuard", () => {
  test("defaults to not dirty", () => {
    const { result } = renderHook(() => useNavigationGuard(), { wrapper })
    expect(result.current.isDirty).toBe(false)
  })

  test("setDirty toggles the flag", () => {
    const { result } = renderHook(() => useNavigationGuard(), { wrapper })
    act(() => result.current.setDirty(true))
    expect(result.current.isDirty).toBe(true)
    act(() => result.current.setDirty(false))
    expect(result.current.isDirty).toBe(false)
  })

  test("blocks beforeunload only while dirty", () => {
    const { result, unmount } = renderHook(() => useNavigationGuard(), {
      wrapper,
    })
    expect(fireBeforeUnload()).toBe(false)

    act(() => result.current.setDirty(true))
    expect(fireBeforeUnload()).toBe(true)

    act(() => result.current.setDirty(false))
    expect(fireBeforeUnload()).toBe(false)

    act(() => result.current.setDirty(true))
    unmount()
    expect(fireBeforeUnload()).toBe(false)
  })

  test("falls back to a no-op outside the provider", () => {
    const { result } = renderHook(() => useNavigationGuard())
    expect(result.current.isDirty).toBe(false)
    expect(() => result.current.setDirty(true)).not.toThrow()
  })
})
