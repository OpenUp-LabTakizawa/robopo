export { auth as middleware } from "@/auth"

export const config = {
    matcher: [
        "/config/:path*",
        "/course/:path*",
        "/player/:path*",
        "/umpire/:path*",
        "/summary/:path*",
    ],
}