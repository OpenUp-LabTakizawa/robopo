import type { NextConfig } from "next"
import withRspack from "next-rspack"

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.URL,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[path][name].[hash][ext]",
      },
    })
    return config
  },
}

export default withRspack(nextConfig)
