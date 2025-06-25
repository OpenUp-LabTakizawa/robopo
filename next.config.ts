import type { NextConfig } from "next"
import { webpack } from "next/dist/compiled/webpack/webpack"
import withRspack from "next-rspack"

const ignorePluginResourceRegExp = /^pg-native$|^cloudflare:sockets$/
const mp3TestRegExp = /\.(mp3)$/

const nextConfig: NextConfig = {
  webpack(config) {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: ignorePluginResourceRegExp,
      }),
    )
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
