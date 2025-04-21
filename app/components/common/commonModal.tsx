"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SelectCompetition } from "@/app/lib/db/schema"

type inputType = "player" | "umpire" | "course"

function getCommonString(type: inputType): string {
  return type === "player" ? "選手" : type === "umpire" ? "採点者" : "コース"
}

export const DeleteModal = ({ type, ids }: { type: inputType; ids: number[] }) => {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const commonString: string = getCommonString(type)
  const handleDelete = async () => {
    try {
      setLoading(true)
      const url = "/api/" + type
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ids }),
      })

      if (response.ok) {
        // 削除成功時の処理
        setSuccessMessage(commonString + "を正常に削除しました")
      } else {
        setErrorMessage(commonString + "を削除できませんでした")
      }
    } catch (error) {
      console.log("error: ", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <dialog id="challenge-modal" className="modal modal-open">
      <div className="modal-box">
        {successMessage ? successMessage : <p>選択した{commonString}を削除しますか?</p>}
        {errorMessage ? errorMessage : <br />}
        {!successMessage && (
          <button className="btn btn-accent m-3" onClick={handleDelete} disabled={loading}>
            はい
          </button>
        )}
        <button
          className="btn btn-accent m-3"
          onClick={() => {
            window.location.href = "/" + type
          }}
          disabled={loading}>
          戻る
        </button>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={() => router.back()}>
        <button className="cursor-default">close</button>
      </form>
    </dialog>
  )
}

export const AssignModal = (params: { type: inputType, ids: number[], competitionList: { competitions: SelectCompetition[] } }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { type, ids, competitionList } = params
  const [competitionId, setCompetitionId] = useState<number | null>(null)
  const commonString: string = getCommonString(type)

  const handleAssign = async () => {
    try {
      setLoading(true)
      const url = "/api/assign/" + type
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, competitionId }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(commonString + "の割当てに成功しました。")
        window.location.href = "/" + type
      } else {
        const errorData = await response.json()
        console.error("Error assigning:", errorData)
        alert(commonString + "の割当てに失敗しました。")
      }
    } catch (error) {
      console.log("error: ", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnassign = async () => {
    try {
      setLoading(true)
      const url = "/api/assign/" + type
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids, competitionId }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Player unassigned successfully:", data)
        alert(commonString + "の割当てを解除しました。")
        window.location.href = "/" + type
      } else {
        const errorData = await response.json()
        console.error("Error unassigning player:", errorData)
        alert(commonString + "の割当て解除に失敗しました。")
      }
    }
    catch (error) {
      console.log("error: ", error)
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
            value={competitionId || 0}>
            <option value={0} disabled>
              大会を選んでください
            </option>
            {competitionList?.competitions?.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>

        </div>
        <button className="btn btn-accent m-3" onClick={handleAssign} disabled={loading}>
          {loading ? <span className="loading loading-spinner"></span> : "大会を割り当てる"}
        </button>
        <button className="btn btn-accent m-3" onClick={handleUnassign} disabled={loading}>
          {loading ? <span className="loading loading-spinner"></span> : "大会割り当て解除"}
        </button>
        <button
          className="btn btn-accent m-3"
          onClick={() => {
            window.location.href = "/" + type
          }}
          disabled={loading}>
          戻る
        </button>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={() => router.back()}>
        <button className="cursor-default">close</button>
      </form>
    </dialog>
  )
}
