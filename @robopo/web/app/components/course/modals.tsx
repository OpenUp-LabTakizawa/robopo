"use client"

import type { Route } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import {
  checkValidity,
  serializeField,
  serializeMission,
  serializePoint,
} from "@/app/components/course/utils"
import { useCourseEdit } from "@/app/course/edit/courseEditContext"
import { BackLabelWithIcon } from "@/app/lib/const"

// Modal asking whether to save before exiting
export function BackModal() {
  const router = useRouter()
  function handleYes() {
    // Remove /back from current URL and navigate to /save
    const currentUrl = window.location.href
    const newUrl = currentUrl.replace(/\/back$/, "/save") as Route
    router.push(newUrl)
  }

  function handleCancel() {
    router.back()
  }
  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <p>保存しますか?保存していない編集内容は失われます。</p>
        <div className="modal-action">
          <button type="button" className="btn btn-accent" onClick={handleYes}>
            はい
          </button>
          {/* Neither router.push("/course") nor Link navigation closes the modal, even when /course/@modal/page.tsx and /course/@modal/[...catchAll]/page.tsx return null.
              As a workaround, using window.location.replace("/course") for navigation. */}
          <button
            type="button"
            className="btn"
            onClick={() => window.location.replace("/course")}
          >
            保存せず終わる
          </button>
          <button type="button" className="btn" onClick={handleCancel}>
            キャンセル
          </button>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={handleCancel}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "") {
            handleCancel()
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

// Modal for saving a course
export function SaveModal({ courseId }: { courseId: number | null }) {
  const { name, setName, field, mission, point } = useCourseEdit()
  const router = useRouter()
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const { pending } = useFormStatus()

  async function handleClick(id: number | null) {
    if (name.trim() === "") {
      alert("コース名を入力してください")
      return
    }

    const courseData = {
      name: name,
      field: serializeField(field),
      mission: serializeMission(mission),
      point: serializePoint(point),
    }

    const res = await fetch(id ? `/api/course?id=${id}` : "/api/course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    })
    if (res.ok) {
      setIsSuccess(true)
      alert("コースを保存しました")
    } else {
      setIsSuccess(false)
      alert("コースの保存に失敗しました")
    }
  }

  function handleClickNo() {
    router.back()
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <form>
          <label htmlFor="name" className="label">
            コース名(必須)
            <input
              type="text"
              placeholder="コース名"
              className="input input-bordered w-full max-w-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          {isSuccess ? <p>コース一覧に戻りますか?</p> : <p>保存しますか?</p>}
          <div className="modal-action">
            {isSuccess ? (
              <Link href="/course" className="btn btn-accent">
                はい
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={pending}
                  onClick={() => {
                    handleClick(null)
                  }}
                >
                  {pending ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    "新規保存"
                  )}
                </button>
                {courseId && (
                  <button
                    type="button"
                    className="btn btn-accent"
                    disabled={pending}
                    onClick={() => {
                      handleClick(courseId)
                    }}
                  >
                    {pending ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "上書き保存"
                    )}
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              disabled={pending}
              className="btn"
              onClick={handleClickNo}
            >
              {pending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "いいえ"
              )}
            </button>
          </div>
        </form>
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={handleClickNo}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleClickNo()
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

// Modal displaying course validation results
export function ValidationModal() {
  const { field, mission } = useCourseEdit()
  const router = useRouter()
  const check = checkValidity(field, mission)
  function handleYes() {
    // Remove /valid from current URL and navigate to /save
    const currentUrl = window.location.href
    const newUrl = currentUrl.replace(/\/valid$/, "/save") as Route
    router.push(newUrl)
  }

  function handleCancel() {
    router.back()
  }
  return (
    <dialog className="modal modal-open" onClose={() => handleCancel()}>
      <div className="modal-box">
        {check ? (
          <>
            <p>コースとミッションは有効です。</p>
            <p>保存しますか?保存していない編集内容は失われます。</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-accent"
                onClick={handleYes}
              >
                はい
              </button>
              <button type="button" className="btn" onClick={handleCancel}>
                編集に
                <BackLabelWithIcon />
              </button>
            </div>
          </>
        ) : (
          <>
            <p>コースとミッションが有効ではありません。</p>
            <button type="button" className="btn" onClick={handleCancel}>
              閉じる
            </button>
          </>
        )}
      </div>
      <form
        method="dialog"
        className="modal-backdrop"
        onClick={handleCancel}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            handleCancel()
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
