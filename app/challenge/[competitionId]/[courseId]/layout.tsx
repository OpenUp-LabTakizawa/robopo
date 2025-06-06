import { NavigationGuardProvider } from "next-navigation-guard"
import "@/app/globals.css"

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
