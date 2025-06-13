import type { NextConfig } from "next"
import { webpack } from "next/dist/compiled/webpack/webpack"

const ignorePluginResourceRegExp = /^pg-native$|^cloudflare:sockets$/
const mp3TestRegExp = /\.(mp3)$/

const nextConfig: NextConfig = {
  env: {
    // biome-ignore lint/style/useNamingConvention: ここをcamelCaseにすると、Next.jsの環境変数の仕様に合わないため。
    NEXT_PUBLIC_BASE_URL: process.env.URL ?? undefined,
  },
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

// biome-ignore lint/style/noDefaultExport: ここはdefault exportを消しては駄目であろうから。
export default nextConfig
