"use client"

import { createContext, type ReactNode, use, useEffect, useState } from "react"

type NavigationGuardContextType = {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
}

const NavigationGuardContext = createContext<NavigationGuardContextType>({
  isDirty: false,
  setDirty: () => {},
})

export const useNavigationGuard = () => use(NavigationGuardContext)

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const [isDirty, setDirty] = useState(false)

  useEffect(() => {
    if (!isDirty) {
      return
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  return (
    <NavigationGuardContext value={{ isDirty, setDirty }}>
      {children}
    </NavigationGuardContext>
  )
}
