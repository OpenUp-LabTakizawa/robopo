"use client"
import { useCallback, useState } from "react"
import type { SelectPlayer, SelectUmpire, SelectCompetition } from "@/app/lib/db/schema"
import { getPlayerList, getUmpireList, getCompetitionList } from "@/app/components/server/db"

type CommonRegisterProps = {
  type: "player" | "umpire" | "course" | "competition"
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>
  setCommonDataList: React.Dispatch<React.SetStateAction<SelectPlayer[] | SelectUmpire[] | SelectCompetition[]>>
}

const CommonRegister = ({ type, setSuccessMessage, setErrorMessage, setCommonDataList }: CommonRegisterProps) => {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [furigana, setFurigana] = useState("")
  const [zekken, setZekken] = useState("")
  const [qr, setQr] = useState("")

  const formItems = [
    (type === "competition"
      ? { label: "name", dispName: "大会名", value: name, setValue: setName }
      : { label: "name", dispName: "名前", value: name, setValue: setName }
    ),
    ...(type === "player"
      ? [
        { label: "furigana", dispName: "ふりがな", value: furigana, setValue: setFurigana },
        { label: "zekken", dispName: "ゼッケン番号", value: zekken, setValue: setZekken },
        { label: "qr", dispName: "QRコード", value: qr, setValue: setQr },
      ]
      : []),
  ]

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const commonData = { name, ...(type === "player" ? { furigana, zekken, qr } : {}) }

    try {
      // APIにPOSTリクエストを送信
      const url = type === "player" ? "/api/player" : type === "umpire" ? "/api/umpire" : "/api/competition"
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commonData),
      })

      const result = await response.json()

      if (response.ok) {
        // 登録成功時の処理
        if (type === "player") {
          setSuccessMessage("プレイヤーが正常に登録されました")
          setName("")
          setFurigana("")
          setZekken("")
          setQr("")
          const newCommonDataList: { players: SelectPlayer[] } = await getPlayerList()
          setCommonDataList(newCommonDataList.players)
        } else if (type === "umpire") {
          setSuccessMessage("採点者が正常に登録されました")
          setName("")
          const newCommonDataList: { umpires: SelectUmpire[] } = await getUmpireList()
          type === "umpire" && setCommonDataList(newCommonDataList.umpires as SelectUmpire[])
        } else {
          setSuccessMessage("大会が正常に登録されました")
          setName("")
          const newCommonDataList: { competitions: SelectCompetition[] } = await getCompetitionList()
          type === "competition" && setCommonDataList(newCommonDataList.competitions as SelectCompetition[])
        }
      } else {
        // エラーメッセージを表示
        setErrorMessage(result.message || "登録中にエラーが発生しました")
      }
    } catch (error) {
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
        <label htmlFor={label} className="block text-sm font-medium text-gray-700">
          {dispName}
        </label>
        <input
          type="text"
          id={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className="mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>
    ),
    []
  )

  return (
    <div className=" flex justify-center">
      <form onSubmit={handleSubmit} className="space-y-4">
        <button type="submit" disabled={loading} className="btn btn-primary mx-auto m-3">
          {loading ? "登録中..." : "↓新規登録"}
        </button>
        {formItems.map((item, index) => (
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

export default CommonRegister
