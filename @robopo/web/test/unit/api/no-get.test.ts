import { describe, expect, test } from "bun:test"

describe("API routes should not export GET handlers", () => {
  test("api/player/route.ts does not export GET", async () => {
    const mod = await import("@/app/api/player/route")
    expect(mod.GET).toBeUndefined()
    expect(mod.POST).toBeDefined()
    expect(mod.DELETE).toBeDefined()
  })

  test("api/umpire/route.ts does not export GET", async () => {
    const mod = await import("@/app/api/umpire/route")
    expect(mod.GET).toBeUndefined()
    expect(mod.POST).toBeDefined()
    expect(mod.DELETE).toBeDefined()
  })

  test("api/competition/route.ts does not export GET", async () => {
    const mod = await import("@/app/api/competition/route")
    expect(mod.GET).toBeUndefined()
    expect(mod.POST).toBeDefined()
    expect(mod.DELETE).toBeDefined()
  })

  test("api/course/list/route.ts does not exist", async () => {
    let importFailed = false
    try {
      await import("@/app/api/course/list/route")
    } catch {
      importFailed = true
    }
    expect(importFailed).toBe(true)
  })
})
