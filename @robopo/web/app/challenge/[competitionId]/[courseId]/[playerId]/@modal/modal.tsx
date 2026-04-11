"use client"

import { MapIcon, PlayIcon, UserIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { type RefObject, useEffect, useRef } from "react"
import {
  SoundController,
  useAudioContext,
} from "@/app/challenge/[competitionId]/[courseId]/[playerId]/audioContext"
import { BackButton } from "@/app/components/parts/buttons"
import type { SelectCourse, SelectPlayer } from "@/app/lib/db/schema"

export function Modal({
  courseData,
  playerData,
}: {
  courseData: SelectCourse
  playerData: SelectPlayer
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startSound = audioRef.current
  const router = useRouter()
  const { muted, setStarted } = useAudioContext()
  const dialogRef: RefObject<HTMLDialogElement | null> =
    useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (startSound) {
      startSound.volume = 0.4
    }
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal()
    }
  }, [startSound])

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box mt-auto mb-0 flex max-w-md flex-col p-0">
        {/* Hero header with gradient accent bar */}
        <div className="relative overflow-hidden rounded-t-[1.5rem] bg-gradient-to-br from-primary to-primary/80 px-6 pt-6 pb-5">
          {/* Decorative background circles */}
          <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-white/5" />

          <p className="relative mb-3 text-center font-semibold text-primary-content/70 text-xs uppercase tracking-widest">
            Challenge Ready
          </p>
          <h2 className="relative text-center font-bold text-2xl text-primary-content tracking-tight">
            チャレンジを開始しますか?
          </h2>
        </div>

        {/* Info cards */}
        <div className="flex flex-col gap-3 px-6 pt-5">
          {/* Course info card */}
          <div className="flex items-center gap-4 rounded-2xl border border-base-300/50 bg-base-200/50 px-4 py-3.5 transition-all">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-base-content/50 text-xs uppercase tracking-wider">
                コース
              </p>
              <p className="truncate font-bold text-base-content text-lg leading-tight">
                {courseData.name}
              </p>
            </div>
          </div>

          {/* Player info card */}
          <div className="flex items-center gap-4 rounded-2xl border border-base-300/50 bg-base-200/50 px-4 py-3.5 transition-all">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <UserIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-base-content/50 text-xs uppercase tracking-wider">
                選手
              </p>
              <p className="truncate font-bold text-base-content text-lg leading-tight">
                {playerData.name}
              </p>
            </div>
          </div>
        </div>

        {/* Action area */}
        <div className="flex flex-col items-center gap-3 px-6 pt-5 pb-6">
          {/* Start button - big, bold, energetic */}
          <button
            type="button"
            className="btn btn-accent start-btn-glow w-full rounded-2xl py-7 font-bold text-2xl tracking-wide shadow-accent/30 shadow-xl transition-all duration-200 hover:shadow-2xl hover:shadow-accent/40 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none"
            onClick={() => {
              !muted && startSound?.play()
              setStarted(true)
              dialogRef.current?.close()
            }}
          >
            <PlayIcon className="size-7" />
            スタート
          </button>

          <SoundController />
          <audio src="/sound/01_start.mp3" ref={audioRef} muted={muted} />

          <BackButton onClick={() => router.back()} fullWidth />
        </div>
      </div>
    </dialog>
  )
}
