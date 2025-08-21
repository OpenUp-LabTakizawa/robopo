"use client"

import type React from "react"
import { useCallback, useState } from "react"
import {
  getCompetitionList,
  getPlayerList,
  getUmpireList,
} from "@/app/components/server/db"
import type {
  SelectCompetition,
  SelectPlayer,
  SelectUmpire,
} from "@/app/lib/db/schema"

export function CommonRegister({
  type,
  setSuccessMessage,
  setErrorMessage,
  setCommonDataList,
}: {
  type: "player" | "umpire" | "course" | "competition"
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>
  setCommonDataList: React.Dispatch<
    React.SetStateAction<SelectPlayer[] | SelectUmpire[] | SelectCompetition[]>
  >
}) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [furigana, setFurigana] = useState("")
  const [zekken, setZekken] = useState("")
  const [qr, setQr] = useState("")

  const formItems = [
    type === "competition"
      ? { label: "name", dispName: "大会名", value: name, setValue: setName }
      : { label: "name", dispName: "名前", value: name, setValue: setName },
    ...(type === "player"
      ? [
          {
            label: "furigana",
            dispName: "ふりがな",
            value: furigana,
            setValue: setFurigana,
          },
          {
            label: "zekken",
            dispName: "ゼッケン番号",
            value: zekken,
            setValue: setZekken,
          },
          { label: "qr", dispName: "QRコード", value: qr, setValue: setQr },
        ]
      : []),
  ]

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const commonData = {
      name,
      ...(type === "player" ? { furigana, zekken, qr } : {}),
    }

    try {
      // APIにPOSTリクエストを送信
      const url =
        type === "player"
          ? "/api/player"
          : type === "umpire"
            ? "/api/umpire"
            : "/api/competition"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commonData),
      })

      const result = await response.json()

      if (response.ok) {
        setName("")
        // 登録成功時の処理
        if (type === "player") {
          setSuccessMessage("プレイヤーが正常に登録されました")
          setFurigana("")
          setZekken("")
          setQr("")
          const players: SelectPlayer[] = await getPlayerList()
          setCommonDataList(players)
        } else if (type === "umpire") {
          setSuccessMessage("採点者が正常に登録されました")
          const umpires: SelectUmpire[] = await getUmpireList()
          setCommonDataList(umpires)
        } else {
          setSuccessMessage("大会が正常に登録されました")
          const newCommonDataList: { competitions: SelectCompetition[] } =
            await getCompetitionList()
          type === "competition" &&
            setCommonDataList(
              newCommonDataList.competitions as SelectCompetition[],
            )
        }
      } else {
        // エラーメッセージを表示
        setErrorMessage(result.message || "登録中にエラーが発生しました")
      }
    } catch {
      // ネットワークエラーやその他のエラーの処理
      setErrorMessage("エラーが発生しました。もう一度お試しください。")
    } finally {
      setLoading(false)
    }
  }

  //   個々の入力フォーム
  const FormItem = useCallback(
    ({
      label,
      dispName,
      value,
      setValue,
    }: {
      label: string
      dispName: string
      value: string
      setValue: React.Dispatch<React.SetStateAction<string>>
    }) => (
      <div>
        <label
          htmlFor={label}
          className="block font-medium text-gray-700 text-sm"
        >
          {dispName}
        </label>
        <input
          type="text"
          id={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required={true}
          className="mt-1 rounded-md border border-gray-300 p-2"
        />
      </div>
    ),
    [],
  )

  return (
    <div className="flex justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary m-3 mx-auto"
        >
          {loading ? "登録中..." : "↓新規登録"}
        </button>
        {formItems.map((item) => (
          <FormItem
            key={item.label}
            label={item.label}
            dispName={item.dispName}
            value={item.value}
            setValue={item.setValue}
          />
        ))}
      </form>
    </div>
  )
}
