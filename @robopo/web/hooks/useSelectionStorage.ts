"use client"

import { useCallback, useEffect, useState } from "react"

type StoredSelections = {
  competitionId?: number
  courseId?: number
  judgeId?: number
}

const STORAGE_KEY = "robopo-selections"

function readStorage(): StoredSelections {
  if (typeof window === "undefined") {
    return {}
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useSelectionStorage() {
  const [stored, setStored] = useState<StoredSelections>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setStored(readStorage())
    setIsLoaded(true)
  }, [])

  const save = useCallback((partial: Partial<StoredSelections>) => {
    // Always read fresh from localStorage to avoid stale state
    const current = readStorage()
    const next: Record<string, unknown> = { ...current, ...partial }
    // Remove keys explicitly set to undefined
    for (const key of Object.keys(next)) {
      if (next[key] === undefined) {
        delete next[key]
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage full or unavailable
    }
    setStored(next as StoredSelections)
  }, [])

  return { stored, isLoaded, save }
}
