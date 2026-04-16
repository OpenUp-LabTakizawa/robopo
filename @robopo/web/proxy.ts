import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/signIn", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/config/:path*",
    "/course/:path*",
    "/player/:path*",
    "/judge/:path*",
    "/summary/:path*",
    "/admin/:path*",
  ],
}
