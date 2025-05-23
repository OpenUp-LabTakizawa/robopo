import type { Metadata } from "next"
import { NavigationGuardProvider } from "next-navigation-guard"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "ROBOPO",
  description: "robopo",
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <NavigationGuardProvider>
      {children}
    </NavigationGuardProvider>
  )
}
