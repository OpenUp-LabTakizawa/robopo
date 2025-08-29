import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Header from "@/app/components/header/header"
import HeaderServer from "@/app/components/header/headerServer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default async function RootLayout(props: LayoutProps<"/">) {
  const { session } = await HeaderServer()
  return (
    <html lang="ja" className={inter.className}>
      <body className="font-zenKakuGothicNew">
        <main className="mx-auto h-screen w-screen text-xs sm:px-12 lg:text-base">
          <Header session={session} />
          {props.children}
          {props.auth}
        </main>
      </body>
    </html>
  )
}
