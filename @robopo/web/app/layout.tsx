import type { Metadata } from "next"
import { Inter, Noto_Sans_JP } from "next/font/google"
import { Suspense } from "react"
import Header from "@/components/header/header"
import { HeaderLogo } from "@/components/header/headerLogo"
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
  title: {
    default: "ROBOPO",
    template: "%s | ROBOPO",
  },
  description: "ロボサバ大会集計アプリ",
}

async function HeaderWithSession() {
  const { session } = await HeaderServer()
  return <Header session={session} />
}

// Placeholder for the session-dependent actions only. It must not repeat any
// markup that <Header /> renders: while the boundary streams in, React holds
// both the fallback and the resolved content in the DOM for a few frames, so
// duplicated elements would briefly be queryable twice.
function HeaderFallback() {
  return <div className="h-8 w-40 animate-pulse rounded-full bg-base-300" />
}

export default function RootLayout(props: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-noto-sans-jp)] antialiased">
        <NavigationGuardProvider>
          <main className="mx-auto min-h-dvh w-full text-sm sm:px-6 lg:px-12 lg:text-base">
            {/* The landmark itself stays outside the boundary so that the page
                never has two <header> elements while the session resolves. */}
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-base-300 border-b bg-base-100/95 px-4 backdrop-blur-sm sm:px-0">
              <HeaderLogo />
              <Suspense fallback={<HeaderFallback />}>
                <HeaderWithSession />
              </Suspense>
            </header>
            {props.children}
            {props.auth}
          </main>
        </NavigationGuardProvider>
      </body>
    </html>
  )
}
