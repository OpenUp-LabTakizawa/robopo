"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SelectCompetition } from "@/app/lib/db/schema"

export const AssignPlayerModal = (params: { playerId: number[], competitionList: { competitions: SelectCompetition[] } }) => {
  const { playerId, competitionList } = params
  const [competitionId, setCompetitionId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAssign = async () => {
    setLoading(true)
    const response = await fetch(`/api/assign/player`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerId, competitionId }),
    })

    if (response.ok) {
    const data = await response.json()
    console.log("Player assigned successfully:", data)
    alert("選手の割当てに成功しました。")
    window.location.href = "/player"
    } else {
    const errorData = await response.json()
    console.error("Error assigning player:", errorData)
    alert("選手の割当てに失敗しました。")
    }
    setLoading(false)
  }

  const handleUnassign = async () => {
    setLoading(true)
    const response = await fetch(`/api/assign/player`, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ playerId, competitionId }),
    })

    if (response.ok) {
    const data = await response.json()
    console.log("Player unassigned successfully:", data)
    alert("選手の割当てを解除しました。")
    window.location.href = "/player"
    } else {
    const errorData = await response.json()
    console.error("Error unassigning player:", errorData)
    alert("選手の割当て解除に失敗しました。")
    }
    setLoading(false)
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
    window.location.href = "/player"
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
