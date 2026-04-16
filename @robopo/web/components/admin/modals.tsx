"use client"

import {
  CircleCheck,
  CircleX,
  Eye,
  EyeOff,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react"
import { useState } from "react"
import type { SelectAdmin } from "@/lib/db/schema"

type AdminFormModalProps = {
  mode: "create" | "edit"
  admin?: SelectAdmin | null
  onClose: () => void
  onSuccess: (newList: SelectAdmin[]) => void
}

export function AdminFormModal({
  mode,
  admin,
  onClose,
  onSuccess,
}: AdminFormModalProps) {
  const [username, setUsername] = useState(admin?.username ?? "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (mode === "create") {
      if (!username.trim()) {
        setError("ユーザー名は必須です。")
        return
      }
      if (!/^[a-z0-9_]+$/.test(username.trim())) {
        setError("ユーザー名は英小文字・数字・アンダースコアのみ使用できます。")
        return
      }
      if (!password || password.length < 8) {
        setError("パスワードは8文字以上で入力してください。")
        return
      }
    }

    if (mode === "edit") {
      if (username.trim() && !/^[a-z0-9_]+$/.test(username.trim())) {
        setError("ユーザー名は英小文字・数字・アンダースコアのみ使用できます。")
        return
      }
      if (password && password.length < 8) {
        setError("パスワードは8文字以上で入力してください。")
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const body: Record<string, unknown> = {}

      if (mode === "create") {
        body.username = username.trim()
        body.password = password
      } else {
        if (username.trim() && username.trim() !== admin?.username) {
          body.username = username.trim()
        }
        if (password) {
          body.password = password
        }
      }

      const url = mode === "create" ? "/api/admin" : `/api/admin/${admin?.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (result.newList) {
          onSuccess(result.newList)
        } else {
          window.location.href = "/admin"
        }
      } else {
        setError(result.message || "エラーが発生しました。")
      }
    } catch {
      setError("通信エラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {mode === "create" ? (
              <span className="flex items-center gap-2">
                <Plus className="size-5" />
                管理者を追加
              </span>
            ) : (
              "管理者を編集"
            )}
          </h3>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text font-medium">ユーザー名</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl lowercase"
              placeholder="英小文字・数字（例: admin1）"
              pattern="[a-z0-9_]+"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              disabled={loading}
              autoComplete="off"
            />
            <p className="mt-1 text-base-content/40 text-xs">
              英小文字・数字・アンダースコアのみ使用可能
            </p>
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text font-medium">
                パスワード
                {mode === "edit" && (
                  <span className="ml-1 text-base-content/50 text-xs">
                    (変更する場合のみ入力)
                  </span>
                )}
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full rounded-xl pr-12"
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm absolute top-1/2 right-2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-2.5 text-error text-sm">
              <CircleX className="size-5 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost rounded-xl"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : mode === "create" ? (
                "作成"
              ) : (
                "保存"
              )}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  )
}

type AdminDeleteModalProps = {
  admins: SelectAdmin[]
  onClose: () => void
  onSuccess: (newList: SelectAdmin[]) => void
}

export function AdminDeleteModal({
  admins,
  onClose,
  onSuccess,
}: AdminDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admins.map((a) => a.id) }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccessMessage("管理者を削除しました。")
        if (result.newList) {
          setTimeout(() => onSuccess(result.newList), 1000)
        }
      } else {
        setErrorMessage(result.message || "削除に失敗しました。")
      }
    } catch {
      setErrorMessage("通信エラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-sm">
        <div className="flex flex-col items-center px-2 py-2">
          {successMessage ? (
            <div className="flex flex-col items-center gap-3">
              <CircleCheck className="size-12 text-success" />
              <p className="text-center font-medium">{successMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <TriangleAlert className="size-12 text-warning" />
              <p className="text-center font-medium">
                以下の管理者を削除しますか？
              </p>
              <div className="flex flex-col gap-1">
                {admins.map((a) => (
                  <span key={a.id} className="badge badge-outline badge-sm">
                    {a.username}
                  </span>
                ))}
              </div>
              <p className="text-center text-base-content/60 text-sm">
                この操作は元に戻せません。関連するセッションやアカウントデータもすべて削除されます。
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 flex w-full items-center gap-2 rounded-lg bg-error/10 px-4 py-2.5 text-error text-sm">
              <CircleX className="size-5 shrink-0" />
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex w-full flex-col gap-2">
            {!successMessage && (
              <button
                type="button"
                className="btn btn-error w-full rounded-xl shadow-error/20 shadow-lg transition-all duration-200 hover:shadow-error/30 hover:shadow-xl"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    削除中
                    <span className="loading loading-spinner loading-sm" />
                  </>
                ) : (
                  "削除する"
                )}
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost w-full rounded-xl"
              onClick={onClose}
              disabled={loading}
            >
              {successMessage ? "閉じる" : "キャンセル"}
            </button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  )
}
