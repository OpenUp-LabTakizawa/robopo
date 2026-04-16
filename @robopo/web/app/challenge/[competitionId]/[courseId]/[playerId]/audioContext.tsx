"use client"

import { Volume2, VolumeX } from "lucide-react"
import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"

export type AudioContextType = {
  muted: boolean
  setMuted: React.Dispatch<React.SetStateAction<boolean>>
  started: boolean
  setStarted: React.Dispatch<React.SetStateAction<boolean>>
}

const dummy: AudioContextType = {
  muted: true,
  setMuted: () => {
    throw new Error("setMuted called outside of AudioContext provider")
  },
  started: false,
  setStarted: () => {
    throw new Error("setStarted called outside of AudioContext provider")
  },
}

const AudioContext = createContext<AudioContextType>(dummy)

export function useAudioContext() {
  return useContext(AudioContext)
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState<boolean>(dummy.muted)
  const [started, setStarted] = useState<boolean>(false)

  return (
    <AudioContext.Provider value={{ muted, setMuted, started, setStarted }}>
      {children}
    </AudioContext.Provider>
  )
}

export function SoundController() {
  const { muted, setMuted } = useAudioContext()
  const previewRef = useRef<HTMLAudioElement | null>(null)

  const handleToggle = () => {
    if (muted) {
      // OFF → ON: Play preview sound to let user check volume
      if (!previewRef.current) {
        previewRef.current = new Audio("/sound/02_next.mp3")
        previewRef.current.volume = 0.4
      }
      const audio = previewRef.current
      audio.currentTime = 0
      audio.play().catch(() => {
        // Ignore play errors (e.g. autoplay policies or rapid toggling)
      })
    }
    setMuted((prev) => !prev)
  }

  // Cleanup: Release Audio instances on unmount
  useEffect(() => {
    return () => {
      if (previewRef.current) {
        previewRef.current.pause()
        previewRef.current.currentTime = 0
        previewRef.current = null
      }
    }
  }, [])

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm btn-circle"
      onClick={handleToggle}
      aria-label="効果音のオン・オフ切り替え"
    >
      {muted ? (
        <VolumeX className="size-5 text-base-content/40" />
      ) : (
        <Volume2 className="size-5 text-success" />
      )}
    </button>
  )
}
