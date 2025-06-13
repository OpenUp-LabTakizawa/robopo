"use server"

import { BASE_URL } from "@/app/lib/const"
import { deleteCourseById } from "@/app/lib/db/queries/queries"
import type { SelectCourse } from "@/app/lib/db/schema"

// IDを指定してDBからコースを取得する関数
export async function getCourse(id: number): Promise<SelectCourse | null> {
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
    .catch(() => {
      return null // エラーが発生した場合、nullを返す
    })
}

// コースを削除する関数
export async function deleteCourse(
  formData: FormData,
): Promise<{ success: boolean; deletedCount: number; message: string }> {
  const ids = formData.getAll("selectedIds").map((id) => Number(id))
  let deletedCount = 0

  for (const id of ids) {
    try {
      const result = await deleteCourseById(id)

      if (result.length > 0) {
        deletedCount += 1 //削除成功でカウントアップ
      }
    } catch {
      return {
        success: false,
        deletedCount,
        message: "コースの削除に失敗しました",
      }
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
    message: `削除に${isSuccess ? "成功" : "失敗"}しました。${deletedCount}件のコースが削除されました`,
  }
}
