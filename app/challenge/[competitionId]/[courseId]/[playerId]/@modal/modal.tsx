"use client"

import { type RefObject, useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PlayIcon } from "@heroicons/react/24/outline"
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
      <div className="modal-box flex flex-col mt-auto mb-0">
        <div className="flex flex-col items-center overflow-y-auto w-full">
          {courseData !== null && playerData !== null && (
            <div className="grid gap-6 items-start">
              <h2 className="text-lg">チャレンジを開始しますか?</h2>
              <p className="text-2xl">コース: {courseData.name}</p>
              <p className="text-2xl">選手: {playerData.name}</p>
            </div>
          )}
          <button
            className="btn btn-accent min-w-28 max-w-fit text-3xl mx-auto m-5"
            onClick={() => {
              soundOn && startSound && startSound.play()
              modalClose()
            }}>
            <span>スタート</span>
            <PlayIcon className="w-6 h-6" />
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
