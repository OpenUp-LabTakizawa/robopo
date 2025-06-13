"use client"

import { BackLabelWithIcon } from "@/app/lib/const"
import type { SelectCompetition } from "@/app/lib/db/schema"
import { useRouter } from "next/navigation"
import { useState } from "react"

type InputType = "player" | "umpire" | "course"

function getCommonString(type: InputType): string {
  return type === "player" ? "選手" : type === "umpire" ? "採点者" : "コース"
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
  return (
    <button
      type="button"
      className="flex btn btn-accent m-3"
      onClick={() => router.back()}
    >
      <BackLabelWithIcon />
    </button>
  )
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
        // 削除成功時の処理
        setSuccessMessage(`${commonString}を正常に削除しました`)
      } else {
        setErrorMessage(`${commonString}を削除できませんでした`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="challenge-modal" className="modal modal-open">
      <div className="modal-box">
        {successMessage ? (
          successMessage
        ) : (
          <p>選択した{commonString}を削除しますか?</p>
        )}
        {errorMessage ? errorMessage : <br />}
        {!successMessage && (
          <button
            type="button"
            className="btn btn-accent m-3"
            onClick={handleDelete}
            disabled={loading}
          >
            はい
          </button>
        )}
        <button
          type="button"
          className="btn btn-accent m-3"
          onClick={() => {
            window.location.href = `/${type}`
          }}
          disabled={loading}
        >
          <BackLabelWithIcon />
        </button>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}

export function AssignModal(params: {
  type: InputType
  ids: number[]
  competitionList: { competitions: SelectCompetition[] }
}) {
  const [loading, setLoading] = useState(false)
  const { type, ids, competitionList } = params
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
    <dialog id="challenge-modal" className="modal modal-open">
      <div className="modal-box">
        <div>
          <select
            className="select select-bordered m-3"
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
        </div>
        <button
          type="button"
          className="btn btn-accent m-3"
          onClick={handleAssign}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner" />
          ) : (
            "大会を割り当てる"
          )}
        </button>
        <button
          type="button"
          className="btn btn-accent m-3"
          onClick={handleUnassign}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner" />
          ) : (
            "大会割り当て解除"
          )}
        </button>
        <button
          type="button"
          className="btn btn-accent m-3"
          onClick={() => {
            window.location.href = `/${type}`
          }}
          disabled={loading}
        >
          <BackLabelWithIcon />
        </button>
      </div>
      <ModalBackdrop />
    </dialog>
  )
}
