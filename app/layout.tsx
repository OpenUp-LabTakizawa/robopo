import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={inter.className}>
      <body className="font-zenKakuGothicNew">
        <main className="mx-auto text-xs sm:px-12 lg:text-base w-screen h-screen">
          {children}
          {/* <ScrollToTop /> */}
        </main>
        {/* <Footer /> */}
      </body>
    </html>
  )
}
