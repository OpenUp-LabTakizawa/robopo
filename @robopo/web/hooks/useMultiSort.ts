"use client"

import { useState } from "react"

export type SortOrder = "asc" | "desc"

export type SortCondition<K extends string> = {
  key: K
  order: SortOrder
}

type UseMultiSortArgs<T, K extends string> = {
  data: T[]
  defaultSort: SortCondition<K>[]
  compareByKey: (a: T, b: T, key: K) => number
  allKeys: { value: K; label: string }[]
}

// Sort `data` by a list of (key, order) conditions, first condition wins.
// Exported so the ordering can be unit-tested without React.
export function multiSort<T, K extends string>(
  data: readonly T[],
  conditions: readonly SortCondition<K>[],
  compareByKey: (a: T, b: T, key: K) => number,
): T[] {
  return [...data].sort((a, b) => {
    for (const { key, order } of conditions) {
      const cmp = compareByKey(a, b, key)
      if (cmp !== 0) {
        return order === "asc" ? cmp : -cmp
      }
    }
    return 0
  })
}

export function useMultiSort<T, K extends string>({
  data,
  defaultSort,
  compareByKey,
  allKeys,
}: UseMultiSortArgs<T, K>) {
  const [conditions, setConditions] = useState<SortCondition<K>[]>(defaultSort)

  const addSort = (key: K) => {
    setConditions((prev) =>
      prev.some((c) => c.key === key)
        ? prev
        : [...prev, { key, order: "desc" as SortOrder }],
    )
  }

  const removeSort = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleOrder = (index: number) => {
    setConditions((prev) =>
      prev.map((c, i) =>
        i === index ? { ...c, order: c.order === "asc" ? "desc" : "asc" } : c,
      ),
    )
  }

  const resetSort = () => {
    setConditions(defaultSort)
  }

  // Derived values: the React Compiler memoizes these, no useMemo needed.
  const availableKeys = allKeys.filter(
    (opt) => !conditions.some((c) => c.key === opt.value),
  )
  const sorted = multiSort(data, conditions, compareByKey)

  return {
    sorted,
    conditions,
    addSort,
    removeSort,
    toggleOrder,
    resetSort,
    availableKeys,
  }
}
