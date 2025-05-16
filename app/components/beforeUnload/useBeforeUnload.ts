"use client"
import { useRouter } from "next/navigation"
import { useEffect, useId } from "react"

let isForceRouting = false
const activeIds: string[] = []
let lastKnownHref: string

const remove = (array: string[], iteratee: (item: string) => boolean) => {
  const toRemove: number[] = []
  const result = array.filter((item, i) => iteratee(item) && toRemove.push(i))

  toRemove.reverse().forEach(i => array.splice(i, 1))
  return result
}

export const useBeforeUnload = (isActive = true) => {
  const id = useId()
  // Handle <Link> clicks & onbeforeunload(attemptimg to close/refresh browser)
  useEffect(() => {
    if (!isActive) return
    lastKnownHref = window.location.href

    activeIds.push(id)

    // No need to double logic
    if (activeIds.length > 1)
      return () => {
        remove(activeIds, (x) => x === id)
      }

    const handleAnchorClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement
      const targetUrl = anchor.href
      const currentUrl = window.location.href

      if (targetUrl !== currentUrl) {
        if (anchor.getAttribute("data-beforeunload-force")) {
          isForceRouting = true
        }

        const res = beforeUnloadFn()
        if (!res) e.preventDefault()
        lastKnownHref = window.location.href
      }
    }

    let anchorElements: HTMLAnchorElement[] = []

    const disconnectAnchors = () => {
      anchorElements.forEach((anchor) => {
        anchor.removeEventListener("click", handleAnchorClick)
      })
    }

    const handleMutation = () => {
      disconnectAnchors()

      anchorElements = Array.from(document.querySelectorAll("a[href]"))
      anchorElements.forEach((anchor) => {
        anchor.addEventListener("click", handleAnchorClick)
      })
    }

    const mutationObserver = new MutationObserver(handleMutation)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    addEventListener("beforeunload", beforeUnloadFn)

    handleMutation() // Also trigger right away.

    return () => {
      removeEventListener("beforeunload", beforeUnloadFn)
      disconnectAnchors()
      mutationObserver.disconnect()
      remove(activeIds, (x) => x === id)
    }
  }, [isActive, id])
}

const beforeUnloadFn = (event?: BeforeUnloadEvent) => {
  if (isForceRouting) return true

  const message = "Discard unsaved changes?"

  if (event) {
    event.returnValue = message
    return message
  } else {
    return confirm(message)
  }
}

const BeforeUnloadProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter()
  useEffect(() => {
    lastKnownHref = window.location.href
  })

  // Hack nextjs13 popstate impl, so it will include route cancellation.
  // This Provider has to be rendered in the layout phase wrapping the page.
  useEffect(() => {
    let nextjsPopStateHandler: (...args: any[]) => void

    function popStateHandler(...args: any[]) {
      useBeforeUnload.ensureSafeNavigation(
        () => {
          nextjsPopStateHandler(...args)
          lastKnownHref = window.location.href
        },
        () => {
          router.replace(lastKnownHref, { scroll: false })
        }
      )
    }

    addEventListener("popstate", popStateHandler)
    const originalAddEventListener = window.addEventListener
    window.addEventListener = (...args: any[]) => {
      if (args[0] === "popstate") {
        nextjsPopStateHandler = args[1]
        window.addEventListener = originalAddEventListener
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        originalAddEventListener(...args)
      }
    }

    return () => {
      window.addEventListener = originalAddEventListener
      removeEventListener("popstate", popStateHandler)
    }
  }, [router])

  return children
}

useBeforeUnload.Provider = BeforeUnloadProvider

useBeforeUnload.forceRoute = async (cb: () => void | Promise<void>) => {
  try {
    isForceRouting = true
    await cb()
  } finally {
    isForceRouting = false
  }
}

useBeforeUnload.ensureSafeNavigation = (onPerformRoute: () => void, onRouteRejected?: () => void) => {
  if (activeIds.length === 0 || beforeUnloadFn()) {
    onPerformRoute()
  } else {
    onRouteRejected?.()
  }
}
