"use client"

import type React from "react"

type Props = {
  columns: string[]
  loading: boolean
  rowCount: number
  emptyMessage?: string
  noMatchMessage?: string
  hasSearchQuery?: boolean
  children: React.ReactNode
}

export function DataTableShell({
  columns,
  loading,
  rowCount,
  emptyMessage = "データがありません",
  noMatchMessage,
  hasSearchQuery = false,
  children,
}: Props) {
  if (hasSearchQuery && !loading && rowCount === 0 && noMatchMessage) {
    return (
      <div className="text-base-content/40 py-8 text-center">
        {noMatchMessage}
      </div>
    )
  }

  return (
    <div className="border-base-300/50 mx-3 mb-3 min-h-0 overflow-x-auto overflow-y-auto rounded-xl border">
      <table className="table-pin-rows table-zebra table-sm table">
        <thead>
          <tr className="border-base-300/50 bg-base-200/60 border-b">
            {columns.map((label) => (
              <th
                key={label}
                className="text-base-content/50 py-2 text-xs font-semibold tracking-wider whitespace-nowrap uppercase"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            ["sk0", "sk1", "sk2", "sk3", "sk4"].map((id, i) => (
              <tr key={id}>
                {columns.map((col) => (
                  <td key={col} className="py-3">
                    <div
                      className="skeleton-shimmer h-4 w-full rounded"
                      style={{ animationDelay: `${i * 60}ms` }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : rowCount > 0 ? (
            children
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-base-content/40 py-12 text-center"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
