import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  agentRules: false,
  cacheComponents: true,
  experimental: {
    inlineCss: true,
  },
  output: "standalone",
  reactCompiler: true,
  typedRoutes: true,
}

export default nextConfig
