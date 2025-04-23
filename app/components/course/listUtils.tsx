"use server"

import type { SelectCourse } from "@/app/lib/db/schema"
import { deleteCourseById } from "@/app/lib/db/queries/queries"
import { BASE_URL } from "@/app/lib/const"

// IDを指定してDBからコースを取得する関数
export const getCourse = async (id: number): Promise<SelectCourse | null> => {
  return fetch(`${BASE_URL}/api/course?id=${id}`, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) {
        return null
      }
      return res.json()
    })
    .then((data) => {
      return data.getCourse ?? null
    })
    .catch((err) => {
      console.error("Error fetching course: ", err)
      return null // エラーが発生した場合、nullを返す
    })
}

// コースを削除する関数
export const deleteCourse = async (
  formData: FormData
): Promise<{ success: boolean; deletedCount: number; message: string }> => {
  console.log("ids: ", formData)

  const ids = formData.getAll("selectedIds").map((id) => Number(id))
  let deletedCount = 0

  for (const id of ids) {
    try {
      const result = await deleteCourseById(id)

      if (result.length > 0) {
        deletedCount += 1 //削除成功でカウントアップ
      }
      console.log("result: ", result)
    } catch (error) {
      console.log("error: ", error)
    }
  }
  if (ids.length === 0) {
    return {
      success: false,
      deletedCount,
      message: "何も選択されていません",
    }
  }

  const isSuccess = deletedCount === ids.length
  return {
    success: isSuccess,
    deletedCount,
    message: isSuccess
      ? `削除に成功しました。${deletedCount}件のコースが削除されました`
      : `削除に失敗しました。${deletedCount}件のコースが削除されました`,
  }
}
