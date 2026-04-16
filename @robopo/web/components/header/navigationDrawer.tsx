"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { NavItem } from "@/lib/navigation"
import {
  ADMIN_SETTINGS_LIST,
  COMPETITION_MANAGEMENT_LIST,
  NAVIGATION_GENERAL_LIST,
} from "@/lib/navigation"

function NavLink({
  item,
  active,
  index,
  isOpen,
  onClick,
}: {
  item: NavItem
  active: boolean
  index: number
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`drawer-item group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200 ${
        active
          ? "border-primary border-l-4 bg-primary/10 text-primary"
          : "border-transparent border-l-4 text-base-content/70 hover:bg-base-200 hover:text-base-content active:scale-[0.98]"
      } ${isOpen ? "drawer-item-visible" : ""}`}
      style={{ "--drawer-item-index": index } as React.CSSProperties}
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center transition-transform duration-200 ${
          active ? "" : "group-hover:scale-110"
        }`}
      >
        {item.icon}
      </span>
      {item.label}
    </Link>
  )
}

export function NavigationDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasBeenOpened, setHasBeenOpened] = useState(false)
  const pathname = usePathname()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const close = () => {
    setIsOpen(false)
    // Return focus to trigger button
    requestAnimationFrame(() => {
      triggerRef.current?.focus()
    })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Escape key handler
  // biome-ignore lint/correctness/useExhaustiveDependencies: React Compiler handles memoization of close
  useEffect(() => {
    if (!isOpen) {
      return
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) {
      return
    }
    const drawer = drawerRef.current
    const focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

    // Focus the close button after the drawer slide-in animation starts
    const rafId = requestAnimationFrame(() => {
      const firstFocusable =
        drawer.querySelector<HTMLElement>(focusableSelector)
      firstFocusable?.focus()
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") {
        return
      }
      const focusables = drawer.querySelectorAll<HTMLElement>(focusableSelector)
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const allItems = [
    ...NAVIGATION_GENERAL_LIST,
    ...COMPETITION_MANAGEMENT_LIST,
    ...ADMIN_SETTINGS_LIST,
  ]
  const dividerIndex = NAVIGATION_GENERAL_LIST.length
  const settingsDividerIndex =
    NAVIGATION_GENERAL_LIST.length + COMPETITION_MANAGEMENT_LIST.length

  const drawerOverlay = (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
        tabIndex={-1}
        aria-label="メニューを閉じる"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="ナビゲーションメニュー"
        className={`absolute top-0 right-0 h-full w-72 bg-base-100 shadow-2xl ${
          isOpen
            ? "drawer-slide-in"
            : hasBeenOpened
              ? "drawer-slide-out"
              : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-base-300 border-b px-4">
          <span
            className={`drawer-title font-bold text-base text-base-content/80 ${isOpen ? "drawer-title-visible" : ""}`}
          >
            メニュー
          </span>
          <button
            type="button"
            onClick={close}
            className="btn btn-ghost btn-sm btn-square rounded-full transition-transform duration-200 hover:rotate-90 active:scale-90"
            aria-label="メニューを閉じる"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav
          aria-label="メインナビゲーション"
          className="flex flex-col gap-1 p-3"
        >
          {allItems.map((item, i) => (
            <div key={item.href}>
              {i === dividerIndex && (
                <>
                  <div
                    className={`drawer-divider my-2 border-base-300 border-t ${isOpen ? "drawer-divider-visible" : ""}`}
                    style={{ "--drawer-item-index": i } as React.CSSProperties}
                  />
                  <span
                    className={`drawer-item mb-1 block px-3 font-semibold text-base-content/40 text-xs uppercase tracking-wider ${isOpen ? "drawer-item-visible" : ""}`}
                    style={{ "--drawer-item-index": i } as React.CSSProperties}
                  >
                    大会管理
                  </span>
                </>
              )}
              {i === settingsDividerIndex && (
                <>
                  <div
                    className={`drawer-divider my-2 border-base-300 border-t ${isOpen ? "drawer-divider-visible" : ""}`}
                    style={{ "--drawer-item-index": i } as React.CSSProperties}
                  />
                  <span
                    className={`drawer-item mb-1 block px-3 font-semibold text-base-content/40 text-xs uppercase tracking-wider ${isOpen ? "drawer-item-visible" : ""}`}
                    style={{ "--drawer-item-index": i } as React.CSSProperties}
                  >
                    設定
                  </span>
                </>
              )}
              <NavLink
                item={item}
                active={isActive(item.href)}
                index={i}
                isOpen={isOpen}
                onClick={close}
              />
            </div>
          ))}
        </nav>
      </div>
    </div>
  )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen(true)
          setHasBeenOpened(true)
        }}
        className="btn btn-ghost btn-sm btn-square rounded-full transition-transform duration-200 active:scale-90"
        aria-label="メニューを開く"
      >
        <Menu className="size-5" />
      </button>

      {mounted && createPortal(drawerOverlay, document.body)}
    </>
  )
}
