import type { Metadata } from "next"
import { Inter } from "next/font/google"
import HeaderServer from "@/app/components/header/HeaderServer"
import Header from "@/app/components/header/header"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default async function RootLayout({
  children,
  auth
}: Readonly<{
  children: React.ReactNode
  auth: React.ReactNode
}>) {
  const { session } = await HeaderServer()
  return (
    <html lang="ja" className={inter.className}>
      <body className="font-zenKakuGothicNew">
        <main className="mx-auto text-xs sm:px-12 lg:text-base w-screen h-screen">
          <Header session={session} />
          {children}
          {auth}
        </main>
      </body>
    </html>
  )
}
