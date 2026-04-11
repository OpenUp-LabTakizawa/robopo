import type { Metadata } from "next"
import { Inter, Noto_Sans_JP } from "next/font/google"
import Header from "@/app/components/header/header"
import HeaderServer from "@/app/components/header/headerServer"
import { NavigationGuardProvider } from "@/app/hooks/useNavigationGuard"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "ロボサバ大会集計アプリ",
}

export default async function RootLayout(props: LayoutProps<"/">) {
  const { session } = await HeaderServer()
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-noto-sans-jp)] antialiased">
        <NavigationGuardProvider>
          <main className="mx-auto min-h-dvh w-full text-sm sm:px-6 lg:px-12 lg:text-base">
            <Header session={session} />
            {props.children}
            {props.auth}
          </main>
        </NavigationGuardProvider>
      </body>
    </html>
  )
}
