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
      <label className="input input-bordered bg-base-200/40 focus-within:bg-base-100 flex items-center gap-2 rounded-xl transition-colors lg:max-w-sm lg:flex-1">
        <Search className="text-base-content/40 size-4 shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="grow"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base-content/40 shrink-0 text-xs">ソート:</span>
        {sortConditions.map((sc, index) => (
          <div
            key={sc.key}
            className="border-base-300 bg-base-100 flex items-center gap-1 rounded-lg border px-2 py-1 shadow-sm"
          >
            <span className="bg-primary/10 text-primary flex size-4 items-center justify-center rounded-full text-xs font-bold">
              {index + 1}
            </span>
            <span className="text-xs font-medium">{getSortLabel(sc.key)}</span>
            <button
              type="button"
              className="bg-base-200/60 hover:bg-base-300/60 flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs transition-colors"
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
              className="text-base-content/40 hover:bg-error/10 hover:text-error flex items-center justify-center rounded-full p-0.5 transition-colors"
              onClick={() => onRemoveSort(index)}
              aria-label={`${getSortLabel(sc.key)}のソートを削除`}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {availableKeys.length > 0 && (
          <div className="bg-base-200/50 flex items-center gap-1 rounded-lg px-1.5 py-1">
            <Plus className="text-base-content/40 size-3.5 shrink-0" />
            <select
              className="select select-ghost select-xs text-base-content/60 [&>option]:bg-base-100 [&>option]:text-base-content bg-transparent font-medium focus:outline-none"
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
            className="text-base-content/40 hover:text-error text-xs transition-colors"
            onClick={onReset}
          >
            リセット
          </button>
        )}
      </div>
    </div>
  )
}
