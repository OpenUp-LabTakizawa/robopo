// biome-ignore lint/performance/noBarrelFile: Auth.js公式ドキュメントのやり方に従う。 https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware
export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/config/:path*",
    "/course/:path*",
    "/player/:path*",
    "/umpire/:path*",
    "/summary/:path*",
  ],
  runtime: "nodejs",
}
