import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    inlineCss: true,
  },
  reactCompiler: true,
  typedRoutes: true,
}

export default nextConfig
