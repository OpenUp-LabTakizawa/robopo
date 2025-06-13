import { NavigationGuardProvider } from "next-navigation-guard"
import type React from "react"

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <NavigationGuardProvider>{children}</NavigationGuardProvider>
}
