"use client"

import { useRouter } from "next/navigation"
import { checkValidity } from "@/app/components/course/utils"
import { useCourseEdit } from "@/app/course/edit/courseEditContext"

// Modal displaying course validation results
export function ValidationModal() {
  const { field, mission } = useCourseEdit()
  const router = useRouter()
  const check = checkValidity(field, mission)

  function handleClose() {
    router.back()
  }

  return (
    <dialog className="modal modal-open" onClose={handleClose}>
      <div className="modal-box">
        {check ? (
          <>
            <p>コースとミッションは有効です。</p>
            <div className="modal-action">
              <button type="button" className="btn" onClick={handleClose}>
                閉じる
              </button>
            </div>
          </>
        ) : (
          <>
            <p>コースとミッションが有効ではありません。</p>
            <div className="modal-action">
              <button type="button" className="btn" onClick={handleClose}>
                閉じる
              </button>
            </div>
          </>
        )}
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClose()
          }
        }}
      >
        <button type="button" className="cursor-default">
          close
        </button>
      </form>
    </dialog>
  )
}
