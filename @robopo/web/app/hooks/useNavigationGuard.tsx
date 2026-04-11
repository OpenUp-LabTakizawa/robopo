"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

type NavigationGuardContextType = {
  isDirty: boolean
  setDirty: (dirty: boolean) => void
}

const NavigationGuardContext = createContext<NavigationGuardContextType>({
  isDirty: false,
  setDirty: () => {},
})

export const useNavigationGuard = () => useContext(NavigationGuardContext)

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty)
  }, [])

  useEffect(() => {
    if (!isDirty) {
      return
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  return (
    <NavigationGuardContext.Provider value={{ isDirty, setDirty }}>
      {children}
    </NavigationGuardContext.Provider>
  )
}
