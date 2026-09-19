import { describe, expect, test } from "bun:test"
import { NextRequest } from "next/server"
import { config, proxy } from "@/proxy"

function request(path: string, cookie?: string): NextRequest {
  const req = new NextRequest(`http://localhost:3000${path}`)
  // happy-dom's Request constructor drops the forbidden "cookie" header from
  // init, so attach it afterwards
  if (cookie) {
    req.headers.set("cookie", cookie)
  }
  return req
}

describe("proxy", () => {
  test("redirects to /signIn without a session cookie", () => {
    const res = proxy(request("/course"))
    expect(res.status).toBe(307)
    expect(res.headers.get("location")).toBe("http://localhost:3000/signIn")
  })

  test("ignores unrelated cookies", () => {
    const res = proxy(request("/course", "theme=dark"))
    expect(res.status).toBe(307)
  })

  test("passes through with a Better Auth session cookie", () => {
    const res = proxy(request("/course", "better-auth.session_token=abc.def"))
    expect(res.status).toBe(200)
    expect(res.headers.get("location")).toBeNull()
  })

  test("accepts the secure cookie prefix used over https", () => {
    const res = proxy(
      request("/admin", "__Secure-better-auth.session_token=abc.def"),
    )
    expect(res.status).toBe(200)
  })

  test("matcher covers every protected section", () => {
    for (const section of [
      "config",
      "course",
      "player",
      "judge",
      "summary",
      "admin",
    ]) {
      expect(config.matcher).toContain(`/${section}/:path*`)
    }
  })
})
