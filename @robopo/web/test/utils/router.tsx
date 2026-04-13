import { render } from "@testing-library/react"
import {
  AppRouterContext,
  type AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime"
import type React from "react"

export function createMockRouter(
  overrides: Partial<AppRouterInstance> = {},
): AppRouterInstance {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
    prefetch: () => Promise.resolve(),
    ...overrides,
  }
}

const defaultMockRouter = createMockRouter()

export function renderWithRouter(
  ui: React.ReactElement,
  router: AppRouterInstance = defaultMockRouter,
) {
  return render(
    <AppRouterContext.Provider value={router}>{ui}</AppRouterContext.Provider>,
  )
}
