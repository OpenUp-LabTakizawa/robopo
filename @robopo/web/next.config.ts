import type { NextConfig } from "next"
import withRspack from "next-rspack"

const mp3TestRegExp = /\.(mp3)$/

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: mp3TestRegExp,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[path][name].[hash][ext]",
      },
    })
    return config
  },
}

export default withRspack(nextConfig)
