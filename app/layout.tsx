import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/app/components/header"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default function RootLayout({
  children,
  auth
}: Readonly<{
  children: React.ReactNode
  auth: React.ReactNode
}>) {
  return (
    <html lang="ja" className={inter.className}>
      <body className="font-zenKakuGothicNew">
        <main className="mx-auto text-xs sm:px-12 lg:text-base w-screen h-screen">
          <Header />
          {children}
          {auth}
        </main>
      </body>
    </html>
  )
}
