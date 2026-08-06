import { describe, expect, test } from "bun:test"

describe("API routes should not export GET handlers", () => {
  test("api/player/route.ts does not export GET", async () => {
    const mod = await import("@/app/api/player/route")
    expect("GET" in mod).toBe(false)
    expect(mod.POST).toBeDefined()
    expect(mod.DELETE).toBeDefined()
  })

  test("api/judge/route.ts does not export GET", async () => {
    const mod = await import("@/app/api/judge/route")
    expect("GET" in mod).toBe(false)
    expect(mod.POST).toBeDefined()
    expect(mod.DELETE).toBeDefined()
  })

  test("api/competition/route.ts does not export GET", async () => {
    const mod = await import("@/app/api/competition/route")
    expect("GET" in mod).toBe(false)
    expect(mod.POST).toBeDefined()
    expect(mod.DELETE).toBeDefined()
  })

  test("api/course/list/route.ts does not exist", async () => {
    const missingRoute = "@/app/api/course/list/route"
    let importFailed = false
    try {
      await import(missingRoute)
    } catch {
      importFailed = true
    }
    expect(importFailed).toBe(true)
  })
})
