"use client"

import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { AdminDeleteModal, AdminFormModal } from "@/components/admin/modals"
import type { SelectAdmin } from "@/lib/db/schema"

type SortKey = "id" | "username" | "createdAt"

export function AdminView({
  initialAdminList,
}: {
  initialAdminList: SelectAdmin[]
}) {
  const [adminList, setAdminList] = useState(initialAdminList)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const selectedAdmin =
    selectedIds.length === 1
      ? (adminList.find((a) => a.id === selectedIds[0]) ?? null)
      : null

  const selectedAdmins = adminList.filter((a) => selectedIds.includes(a.id))

  // Filter by search
  const filtered = adminList.filter((a) => {
    if (!searchQuery) {
      return true
    }
    const q = searchQuery.toLowerCase()
    return (a.username ?? "").toLowerCase().includes(q)
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case "id":
        cmp = a.id.localeCompare(b.id)
        break
      case "username":
        cmp = (a.username ?? "").localeCompare(b.username ?? "")
        break
      case "createdAt": {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        cmp = aTime - bTime
        break
      }
    }
    return sortOrder === "asc" ? cmp : -cmp
  })

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  function handleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleSelectAll() {
    const allIds = sorted.map((a) => a.id)
    setSelectedIds((prev) => {
      const allSelected = allIds.every((id) => prev.includes(id))
      return allSelected ? [] : allIds
    })
  }

  function showSuccess(msg: string) {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) {
      return null
    }
    if (k === "username") {
      return sortOrder === "asc" ? (
        <ArrowUpAZ className="size-3.5" />
      ) : (
        <ArrowDownAZ className="size-3.5" />
      )
    }
    return sortOrder === "asc" ? (
      <ArrowUp01 className="size-3.5" />
    ) : (
      <ArrowDown01 className="size-3.5" />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Action bar */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:shadow-xl"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="size-4" />
            新規作成
          </button>
          <button
            type="button"
            className="btn btn-sm rounded-xl transition-all duration-200"
            disabled={selectedIds.length !== 1}
            onClick={() => setEditModalOpen(true)}
          >
            <SquarePen className="size-4" />
            編集
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-xl transition-all duration-200 ${
              selectedIds.length > 0 ? "btn-outline btn-error" : ""
            }`}
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="size-4" />
            削除
          </button>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="mt-2 rounded-lg bg-success/10 px-4 py-2 text-sm text-success">
            {successMessage}
          </div>
        )}

        {/* Search */}
        <label className="input mt-3 flex items-center gap-2 rounded-xl border-base-300/50 bg-base-200/50 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="size-4 text-base-content/40" />
          <input
            type="text"
            className="grow bg-transparent text-sm"
            placeholder="ユーザー名で検索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>

        {/* Sort */}
        <div className="mt-2 flex items-center gap-2 text-base-content/60 text-xs">
          <button
            type="button"
            className={`btn btn-ghost btn-xs gap-1 ${sortKey === "username" ? "text-primary" : ""}`}
            onClick={() => handleSort("username")}
          >
            ユーザー名
            <SortIcon k="username" />
          </button>
          <button
            type="button"
            className={`btn btn-ghost btn-xs gap-1 ${sortKey === "createdAt" ? "text-primary" : ""}`}
            onClick={() => handleSort("createdAt")}
          >
            作成日時
            <SortIcon k="createdAt" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="m-3 min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-base-300/50">
        <table className="table-pin-rows table-zebra table">
          <thead>
            <tr className="border-base-300/50 border-b bg-base-200/60">
              <th className="w-12">
                <label>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary size-4"
                    checked={
                      sorted.length > 0 &&
                      sorted.every((a) => selectedIds.includes(a.id))
                    }
                    onChange={() => handleSelectAll()}
                  />
                </label>
              </th>
              <th className="py-3 font-semibold text-base-content/50 text-xs uppercase tracking-wider">
                ユーザー名
              </th>
              <th className="py-3 font-semibold text-base-content/50 text-xs uppercase tracking-wider">
                最終ログイン
              </th>
              <th className="py-3 font-semibold text-base-content/50 text-xs uppercase tracking-wider">
                作成日時
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length > 0 ? (
              sorted.map((admin) => (
                <tr
                  key={admin.id}
                  className="cursor-pointer transition-colors duration-150 hover:bg-primary/5"
                  onClick={() => handleSelect(admin.id)}
                >
                  <th className="w-12">
                    <label>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary size-4"
                        checked={selectedIds.includes(admin.id)}
                        onChange={() => handleSelect(admin.id)}
                      />
                    </label>
                  </th>
                  <td className="py-3 font-medium">{admin.username}</td>
                  <td
                    className="whitespace-nowrap py-3 text-base-content/60 text-sm"
                    suppressHydrationWarning
                  >
                    {admin.lastLoginAt ? (
                      new Date(admin.lastLoginAt).toLocaleString("ja-JP")
                    ) : (
                      <span className="text-base-content/30">-</span>
                    )}
                  </td>
                  <td
                    className="py-3 text-base-content/60 text-sm"
                    suppressHydrationWarning
                  >
                    {admin.createdAt
                      ? new Date(admin.createdAt).toLocaleString("ja-JP")
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-base-content/40"
                >
                  管理者が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {createModalOpen && (
        <AdminFormModal
          mode="create"
          onClose={() => setCreateModalOpen(false)}
          onSuccess={(newList) => {
            setAdminList(newList)
            setCreateModalOpen(false)
            setSelectedIds([])
            showSuccess("管理者を作成しました。")
          }}
        />
      )}
      {editModalOpen && selectedAdmin && (
        <AdminFormModal
          mode="edit"
          admin={selectedAdmin}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(newList) => {
            setAdminList(newList)
            setEditModalOpen(false)
            setSelectedIds([])
            showSuccess("管理者を更新しました。")
          }}
        />
      )}
      {deleteModalOpen && selectedAdmins.length > 0 && (
        <AdminDeleteModal
          admins={selectedAdmins}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={(newList) => {
            setAdminList(newList)
            setDeleteModalOpen(false)
            setSelectedIds([])
            showSuccess("管理者を削除しました。")
          }}
        />
      )}
    </div>
  )
}
