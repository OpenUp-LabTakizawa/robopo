import NextAuth from "next-auth"
import authConfig from "@/auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: [
    "/config/:path*",
    "/course/:path*",
    "/player/:path*",
    "/umpire/:path*",
    "/summary/:path*",
  ],
}
