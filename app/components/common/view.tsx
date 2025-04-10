"use client"
import { useState, useEffect } from "react"
import type { SelectPlayer, SelectUmpire } from "@/app/lib/db/schema"
import { CommonCheckboxList } from "@/app/components/common/commonList"
import CommonRegister from "@/app/components/common/commonRegister"
import Link from "next/link"
import { useRouter } from "next/navigation"

type PlayerProps = {
  type: "player"
  initialCommonDataList: { players: SelectPlayer[] }
}

type UmpireProps = {
  type: "umpire"
  initialCommonDataList: { umpires: SelectUmpire[] }
}

type ViewProps = PlayerProps | UmpireProps

export const View = ({ type, initialCommonDataList }: ViewProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [commonId, setCommonId] = useState<number[] | null>(null)
  const commonString = type === "player" ? "選手" : "採点者"
  const [commonDataList, setCommonDataList] = useState<SelectPlayer[] | SelectUmpire[]>(
    type === "player" ? initialCommonDataList.players : initialCommonDataList.umpires
  )

  useEffect(() => {
    setCommonDataList(commonDataList)
  }, [commonDataList])

  const DefaultView = () => {
    // 配列をクエリ文字列に変換する関数
    const createQueryParams = (ids: number[] | null) => {
      if (!ids || ids.length === 0) return ""
      return ids.map((id) => `${id}`).join("/")
    }

    return (
      <div className="lg:flex lg:flex-row">
        <div className="flex-col lg:w-2/3">
          <CommonCheckboxList
            props={{ type: "player", commonDataList: commonDataList }}
            commonId={commonId}
            setCommonId={setCommonId}
          />
          {successMessage && <div className="text-green-500 font-semibold">{successMessage}</div>}

          {errorMessage && <div className="text-red-500 font-semibold">{errorMessage}</div>}

          <div className="flex w-fit">
            <p className="flex m-3">選択した{commonString}を</p>
            <Link
              href={
                type === "player"
                  ? `/player/delete/${createQueryParams(commonId)}`
                  : `/umpire/delete/${createQueryParams(commonId)}`
              }
              className={
                "flex btn mx-auto m-3 " +
                (commonId === null || commonId?.length === 0 ? "pointer-events-none btn-disabled" : "btn-primary")
              }
              aria-disabled={commonId === null || commonId?.length === 0}
              tabIndex={commonId === null || commonId?.length === 0 ? -1 : undefined}
              onClick={() => {
                setSuccessMessage(null)
              }}>
              削除
            </Link>
            <button
              type="button"
              className="flex btn btn-primary mx-auto ml-5 m-3"
              disabled={commonId === null || commonId.length === 0}
              onClick={() => {
                setSuccessMessage(null)
              }}>
              大会割当
            </button>
          </div>
        </div>
        <div className="lg:w-1/3">
          <CommonRegister
            type={type}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
            setCommonDataList={
              setCommonDataList as React.Dispatch<React.SetStateAction<SelectPlayer[] | SelectUmpire[]>>
            }
          />
        </div>
      </div>
    )
  }

  return <DefaultView />
}

export const DeleteModal = ({ type, ids }: { type: "player" | "umpire"; ids: number[] }) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const commonString = type === "player" ? "選手" : "採点者"
  const router = useRouter()
  const handleDelete = async () => {
    try {
      console.log("ids: ", ids)
      setLoading(true)
      const url = type === "player" ? "/api/player" : "/api/umpire"
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: ids }),
      })

      if (response.ok) {
        // 削除成功時の処理
        setSuccessMessage(commonString + "が正常に削除されました")
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
            window.location.href = type === "player" ? "/player" : "/umpire"
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
