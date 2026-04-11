import { useCallback, useRef, useState } from "react"

const DEFAULT_MAX_HISTORY = 50

/**
 * Generic undo/redo hook for any state type.
 * Manages history and redo stacks with a configurable max size.
 */
export function useUndoRedo<T>({
  max = DEFAULT_MAX_HISTORY,
  getSnapshot,
  applySnapshot,
}: {
  max?: number
  getSnapshot: () => T
  applySnapshot: (snap: T) => void
}) {
  const historyRef = useRef<T[]>([])
  const redoRef = useRef<T[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const push = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-max + 1), getSnapshot()]
    redoRef.current = []
    setCanUndo(true)
    setCanRedo(false)
  }, [getSnapshot, max])

  const undo = useCallback(() => {
    const history = historyRef.current
    if (history.length === 0) {
      return
    }

    // Save current state to redo stack
    redoRef.current = [...redoRef.current, getSnapshot()]
    setCanRedo(true)

    const prev = history[history.length - 1]
    historyRef.current = history.slice(0, -1)
    setCanUndo(historyRef.current.length > 0)

    applySnapshot(prev)
  }, [getSnapshot, applySnapshot])

  const redo = useCallback(() => {
    const redoStack = redoRef.current
    if (redoStack.length === 0) {
      return
    }

    // Save current state to history stack
    historyRef.current = [...historyRef.current, getSnapshot()]
    setCanUndo(true)

    const next = redoStack[redoStack.length - 1]
    redoRef.current = redoStack.slice(0, -1)
    setCanRedo(redoRef.current.length > 0)

    applySnapshot(next)
  }, [getSnapshot, applySnapshot])

  return { push, undo, redo, canUndo, canRedo }
}
