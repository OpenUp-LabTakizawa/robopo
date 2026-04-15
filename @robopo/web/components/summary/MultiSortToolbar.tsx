"use client"

import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  Plus,
  Search,
  X,
} from "lucide-react"
import type React from "react"
import type { SortCondition, SortOrder } from "@/hooks/useMultiSort"

type SortOption<K extends string> = {
  value: K
  label: string
}

type Props<K extends string> = {
  searchPlaceholder: string
  searchQuery: string
  onSearchChange: (value: string) => void
  sortConditions: SortCondition<K>[]
  availableKeys: SortOption<K>[]
  getSortLabel: (key: K) => string
  getOrderLabel: (key: K, order: SortOrder) => string
  onToggleOrder: (index: number) => void
  onRemoveSort: (index: number) => void
  onAddSort: (key: K) => void
  onReset?: () => void
  isTextKey?: (key: K) => boolean
  /** Extra controls rendered before the search input on lg screens */
  leadingSlot?: React.ReactNode
}

export function MultiSortToolbar<K extends string>({
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  sortConditions,
  availableKeys,
  getSortLabel,
  getOrderLabel,
  onToggleOrder,
  onRemoveSort,
  onAddSort,
  onReset,
  isTextKey,
  leadingSlot,
}: Props<K>) {
  return (
    <div className="flex shrink-0 flex-col gap-2 px-4 pb-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
      {leadingSlot}
      <label className="input input-bordered flex items-center gap-2 rounded-xl bg-base-200/40 transition-colors focus-within:bg-base-100 lg:max-w-sm lg:flex-1">
        <Search className="size-4 shrink-0 text-base-content/40" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="grow"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-base-content/40 text-xs">ソート:</span>
        {sortConditions.map((sc, index) => (
          <div
            key={sc.key}
            className="flex items-center gap-1 rounded-lg border border-base-300 bg-base-100 px-2 py-1 shadow-sm"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
              {index + 1}
            </span>
            <span className="font-medium text-xs">{getSortLabel(sc.key)}</span>
            <button
              type="button"
              className="flex items-center gap-0.5 rounded-md bg-base-200/60 px-1.5 py-0.5 text-xs transition-colors hover:bg-base-300/60"
              onClick={() => onToggleOrder(index)}
            >
              {isTextKey?.(sc.key) ? (
                sc.order === "desc" ? (
                  <ArrowDownAZ className="size-3" />
                ) : (
                  <ArrowUpAZ className="size-3" />
                )
              ) : sc.order === "desc" ? (
                <ArrowDown01 className="size-3" />
              ) : (
                <ArrowUp01 className="size-3" />
              )}
              {getOrderLabel(sc.key, sc.order)}
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-full p-0.5 text-base-content/40 transition-colors hover:bg-error/10 hover:text-error"
              onClick={() => onRemoveSort(index)}
              aria-label={`${getSortLabel(sc.key)}のソートを削除`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {availableKeys.length > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-base-200/50 px-1.5 py-1">
            <Plus className="size-3.5 shrink-0 text-base-content/40" />
            <select
              className="select select-ghost select-xs bg-transparent font-medium text-base-content/60 focus:outline-none [&>option]:bg-base-100 [&>option]:text-base-content"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onAddSort(e.target.value as K)
                  e.target.value = ""
                }
              }}
            >
              <option value="" disabled>
                追加
              </option>
              {availableKeys.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {onReset && (
          <button
            type="button"
            className="text-base-content/40 text-xs transition-colors hover:text-error"
            onClick={onReset}
          >
            リセット
          </button>
        )}
      </div>
    </div>
  )
}
