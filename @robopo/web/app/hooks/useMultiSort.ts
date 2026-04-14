"use client"

import { useMemo, useState } from "react"

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
        i === index
          ? {
              ...c,
              order:
                c.order === "asc"
                  ? ("desc" as SortOrder)
                  : ("asc" as SortOrder),
            }
          : c,
      ),
    )
  }

  const resetSort = () => {
    setConditions(defaultSort)
  }

  const availableKeys = useMemo(
    () => allKeys.filter((opt) => !conditions.some((c) => c.key === opt.value)),
    [allKeys, conditions],
  )

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      for (const { key, order } of conditions) {
        const cmp = compareByKey(a, b, key)
        if (cmp !== 0) {
          return order === "asc" ? cmp : -cmp
        }
      }
      return 0
    })
  }, [data, conditions, compareByKey])

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
