"use client"

import { type RefObject, useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { type SelectCourse, type SelectPlayer } from "@/app/lib/db/schema"
import { useAudioContext, SoundControlUI } from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
import { BackLabelWithIcon } from "@/app/lib/const"
import StartSound from "@/app/lib/sound/01_start.mp3"

type ViewProps = {
  courseData: SelectCourse
  playerData: SelectPlayer
}

export const Modal = ({ courseData, playerData }: ViewProps) => {
  const playerId = playerData.id
  const startSound = new Audio(StartSound)
  startSound.volume = 0.4
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState<boolean>(true)
  const { soundOn, setSoundOn } = useAudioContext()
  const dialogRef: RefObject<HTMLDialogElement | null> = useRef<HTMLDialogElement | null>(null)

  const modalClose = () => {
    dialogRef.current?.close()
    setModalOpen(false)
  }

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal()
    }
  }, [])

  if (!modalOpen) return null
  return (
    <dialog ref={dialogRef} className="modal" open={modalOpen}>
      <div className="modal-box flex flex-col justify-center">
        <div className="flex flex-col justify-center items-center overflow-y-auto w-full pt-10">
          {courseData !== null && playerId !== null && (
            <div className="grid gap-6 items-start justify-center sm:px-6 lg:px-8 text-start">
              <h2 className="text-lg">チャレンジを開始しますか?</h2>
              <p className="text-2xl">コース: {courseData.name}</p>
              <p className="text-2xl">選手: {playerData?.name}</p>
            </div>
          )}

          {/* ここにコースプレビューを入れる */}
          <button
            className="rounded-full flex justify-center items-center font-bold relative mt-10 mb-10 w-48 h-48 text-3xl bg-linear-to-r from-green-400 to-green-600 text-white"
            onClick={() => {
              soundOn && startSound && startSound.play()
              modalClose()
            }}>
            <span>スタート</span>
          </button>
          <SoundControlUI soundOn={soundOn} setSoundOn={setSoundOn} />
          <button
            type="button"
            className="btn btn-primary min-w-28 max-w-fit mx-auto mt-5"
            onClick={() => {
              router.back()
            }}>
            選手選択に<BackLabelWithIcon />
          </button>
        </div>
      </div>
    </dialog>
  )
}
