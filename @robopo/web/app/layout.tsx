import type { Metadata } from "next"
import { Inter, Noto_Sans_JP } from "next/font/google"
import { Suspense } from "react"
import Header from "@/components/header/header"
import HeaderServer from "@/components/header/headerServer"
import { NavigationGuardProvider } from "@/hooks/useNavigationGuard"
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

async function HeaderWithSession() {
  const { session } = await HeaderServer()
  return <Header session={session} />
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-base-300 border-b bg-base-100/95 px-4 backdrop-blur-sm sm:px-0">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 animate-pulse rounded bg-base-300" />
        <span className="font-bold text-lg text-primary">ROBOPO</span>
      </div>
    </header>
  )
}

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-noto-sans-jp)] antialiased">
        <NavigationGuardProvider>
          <main className="mx-auto min-h-dvh w-full text-sm sm:px-6 lg:px-12 lg:text-base">
            <Suspense fallback={<HeaderFallback />}>
              <HeaderWithSession />
            </Suspense>
            {props.children}
            {props.auth}
          </main>
        </NavigationGuardProvider>
      </body>
    </html>
  )
}
