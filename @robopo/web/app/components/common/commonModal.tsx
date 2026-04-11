"use client"

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BackButton } from "@/app/components/parts/buttons"
import type { SelectCompetition } from "@/app/lib/db/schema"

type InputType = "player" | "judge" | "course"

function getCommonString(type: InputType): string {
  return type === "player" ? "選手" : type === "judge" ? "採点者" : "コース"
}

export function ModalBackdrop() {
  const router = useRouter()
  return (
    <form
      method="dialog"
      className="modal-backdrop"
      onClick={() => router.back()}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          router.back()
        }
      }}
    >
      <button type="button" className="cursor-default">
        close
      </button>
    </form>
  )
}

export function ModalBackButton() {
  const router = useRouter()
  return <BackButton onClick={() => router.back()} fullWidth />
}

export function DeleteModal({ type, ids }: { type: InputType; ids: number[] }) {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const commonString: string = getCommonString(type)
  async function handleDelete() {
    try {
      setLoading(true)
      const url = `/api/${type}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ids }),
      })

      if (response.ok) {
        setSuccessMessage(`${commonString}を正常に削除しました`)
      } else {
        setErrorMessage(`${commonString}を削除できませんでした`)
      }
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
              <CheckCircleIcon className="size-12 text-success" />
              <p className="text-center font-medium">{successMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <ExclamationTriangleIcon className="size-12 text-warning" />
              <p className="text-center font-medium">
                選択した{commonString}を削除しますか?
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 flex w-full items-center gap-2 rounded-lg bg-error/10 px-4 py-2.5 text-error text-sm">
              <XCircleIcon className="size-5 shrink-0" />
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
            <BackButton
              onClick={() => {
                window.location.href = `/${type}`
              }}
              disabled={loading}
              fullWidth
            />
          </div>
        </div>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}

export function AssignModal({
  type,
  ids,
  competitionList,
}: {
  type: InputType
  ids: number[]
  competitionList: { competitions: SelectCompetition[] }
}) {
  const [loading, setLoading] = useState(false)
  const [competitionId, setCompetitionId] = useState<number | null>(null)
  const commonString: string = getCommonString(type)

  async function handleAssign() {
    try {
      setLoading(true)
      const url = `/api/assign/${type}`
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, competitionId }),
      })

      if (response.ok) {
        alert(`${commonString}の割当てに成功しました。`)
        window.location.href = `/${type}`
      } else {
        alert(`${commonString}の割当てに失敗しました。`)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleUnassign() {
    try {
      setLoading(true)
      const url = `/api/assign/${type}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, competitionId }),
      })

      if (response.ok) {
        alert(`${commonString}の割当てを解除しました。`)
        window.location.href = `/${type}`
      } else {
        alert(`${commonString}の割当て解除に失敗しました。`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-sm">
        <div className="flex flex-col items-center px-2 py-2">
          <h3 className="mb-4 font-bold text-base-content text-lg">
            大会割り当て
          </h3>

          <select
            className="select w-full rounded-xl border-base-300/50 bg-base-200/50 transition-all duration-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setCompetitionId(Number(event.target.value))}
            value={competitionId || 0}
          >
            <option value={0} disabled={true}>
              大会を選んでください
            </option>
            {competitionList?.competitions?.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>

          <div className="mt-6 flex w-full flex-col gap-2">
            <button
              type="button"
              className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:shadow-xl"
              onClick={handleAssign}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "大会を割り当てる"
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-error w-full rounded-xl transition-all duration-200"
              onClick={handleUnassign}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "大会割り当て解除"
              )}
            </button>
            <BackButton
              onClick={() => {
                window.location.href = `/${type}`
              }}
              disabled={loading}
              fullWidth
            />
          </div>
        </div>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}
