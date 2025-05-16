"use client"
import { useState } from "react"
import Link from "next/link"
import { CommonRadioList } from "@/app/components/common/commonList"
import type { SelectCompetition, SelectPlayer, SelectUmpire, SelectCourse } from "@/app/lib/db/schema"
import CommonRegister from "@/app/components/common/commonRegister"

type CompetitionListTabProps = {
  competitionId: number | null
  setCompetitionId: React.Dispatch<React.SetStateAction<number | null>>
  competitionList: SelectCompetition[]
  setCompetitionList: React.Dispatch<React.SetStateAction<SelectCompetition[]>>
}

type NewCompetitionTabProps = {
  setCompetitionList: React.Dispatch<React.SetStateAction<SelectCompetition[]>>
}

type AssignTabProps = {
  competitionId: number | null
  competitionList: SelectCompetition[]
  courseList: { courses: SelectCourse[] }
  umpireList: { umpires: SelectUmpire[] }
}

export const CompetitionListTab = ({
  competitionId,
  setCompetitionId,
  competitionList,
  setCompetitionList,
}: CompetitionListTabProps): React.JSX.Element => {
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("")
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const handleButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const type = event.currentTarget.value
    const requestBody =
      type === "delete"
        ? {
          type: type,
          id: competitionId,
        }
        : {
          type: type,
        }

    const url = type === "delete" ? "/api/competition/" : "/api/competition/" + competitionId
    try {
      setLoading(true)
      const response = await fetch(url, {
        method: type === "delete" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      const { success, data, newList } = await response.json()

      console.log("data: ", data)
      console.log("newList: ", newList.competitions)
      if (response.ok) {
        setMessage("更新に成功しました")
        setIsSuccess(true)
        setCompetitionList(newList.competitions)
        setCompetitionId(null)
        setModalOpen(false)
      } else {
        setMessage("更新に失敗しました")
      }
    } catch (error) {
      console.log("error: ", error)
      setMessage("送信中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const DeleteModal = () => {
    const handleClick = () => {
      setModalOpen(false)
    }
    return (
      <dialog id="challenge-modal" className="modal modal-open" onClose={() => setModalOpen(false)}>
        <div className="modal-box">
          {isSuccess ? <p>{message}</p> : <p>選択した大会を削除しますか?</p>}

          {!isSuccess && (
            <button
              className="btn btn-accent m-3"
              value="delete"
              onClick={(e) => handleButtonClick(e)}
              disabled={loading}>
              はい
            </button>
          )}
          <button className="btn btn-accent m-3" onClick={handleClick} disabled={loading}>
            戻る
          </button>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={handleClick}>
          <button className="cursor-default">close</button>
        </form>
      </dialog>
    )
  }

  return (
    <>
      <CommonRadioList
        props={{ type: "competition", commonDataList: competitionList }}
        commonId={competitionId}
        setCommonId={setCompetitionId}
      />
      <button
        className="btn btn-primary text-default max-w-fit m-1"
        value="open"
        disabled={
          competitionId === null || loading || competitionList?.find((c) => c.id === competitionId)?.step === 1
        }
        onClick={(e) => handleButtonClick(e)}>
        開催
      </button>
      <button
        className="btn btn-primary text-default max-w-fit m-1"
        value="return"
        disabled={
          competitionId === null || loading || competitionList?.find((c) => c.id === competitionId)?.step !== 1
        }
        onClick={(e) => handleButtonClick(e)}>
        開催前に戻す
      </button>
      <button
        className="btn btn-primary text-default max-w-fit m-1"
        value="close"
        disabled={
          competitionId === null || loading || competitionList?.find((c) => c.id === competitionId)?.step !== 1
        }
        onClick={(e) => handleButtonClick(e)}>
        停止
      </button>
      <button
        className="btn btn-warning text-default max-w-fit m-1"
        disabled={competitionId === null || loading}
        onClick={() => {
          setIsSuccess(false)
          setModalOpen(true)
        }}>
        削除
      </button>
      {isSuccess && <p>{message}</p>}
      <p>{loading && <span className="loading loading-spinner"></span>}</p>
      {modalOpen && <DeleteModal />}
    </>
  )
}

export const NewCompetitionTab = ({ setCompetitionList }: NewCompetitionTabProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  return (
    <>
      <p>新しい大会を追加します</p>
      <CommonRegister
        type="competition"
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
        setCommonDataList={
          setCompetitionList as React.Dispatch<
            React.SetStateAction<SelectPlayer[] | SelectUmpire[] | SelectCompetition[]>
          >
        }
      />
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
    </>
  )
}

export const AssignTab = ({ competitionId, competitionList, courseList, umpireList }: AssignTabProps) => {
  const [courseId, setCourseId] = useState<number | null>(null)
  const [umpireId, setUmpireId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const data = { competitionId, courseId, umpireId }

    try {
      // APIにPOSTリクエストを送信
      const url = "/api/assign"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        // 登録成功時の処理
        setMessage("コース・採点者が正常に割当されました")
      } else {
        // エラーメッセージを表示
        setMessage(result.message || "登録中にエラーが発生しました")
      }
    } catch (error) {
      // ネットワークエラーやその他のエラーの処理
      setMessage("エラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 mt-5 mb-5">
        <p>選択中大会:</p>
        <p>{competitionList?.find((c) => c.id === competitionId)?.name}</p>
        <p>選択中コース:</p>
        <p>{courseList.courses?.find((c) => c.id === courseId)?.name}</p>
        <p>選択中採点者:</p>
        <p>{umpireList.umpires?.find((u) => u.id === umpireId)?.name}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="course" className="block text-sm font-medium text-gray-700">
          コース
        </label>
        <select
          className="select select-bordered m-2"
          onChange={(event) => setCourseId(Number(event.target.value))}
          value={courseId ? courseId : 0}>
          <option value={0} disabled>
            コースを選んでください
          </option>
          {courseList ? (
            courseList.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))
          ) : (
            <option>コースがありません</option>
          )}
        </select>
        <label htmlFor="course" className="block text-sm font-medium text-gray-700">
          採点者
        </label>
        <select
          className="select select-bordered m-2"
          onChange={(event) => setUmpireId(Number(event.target.value))}
          value={umpireId ? umpireId : 0}>
          <option value={0} disabled>
            採点者を選んでください
          </option>
          {umpireList ? (
            umpireList.umpires.map((umpire) => (
              <option key={umpire.id} value={umpire.id}>
                {umpire.name}
              </option>
            ))
          ) : (
            <option>採点者が登録されていません</option>
          )}
        </select>
        <button
          type="submit"
          disabled={loading || competitionId === null || courseId === null || umpireId === null}
          className="btn btn-primary mx-auto m-3">
          {loading ? "割当中..." : "割り当てる"}
        </button>
      </form>
      <Link href="/config/assignList" className="btn btn-primary mx-auto m-3">
        割当一覧
      </Link>
      {message && <p>{message}</p>}
    </>
  )
}
