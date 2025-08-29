"use client"

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline"
import type React from "react"
import { createContext, useContext, useState } from "react"

export type AudioContextType = {
  muted: boolean
  setMuted: React.Dispatch<React.SetStateAction<boolean>>
}

const dummy: AudioContextType = {
  muted: true,
  setMuted: () => {
    throw new Error("setSoundOn called outside of AudioContext provider")
  },
}

const AudioContext = createContext<AudioContextType>(dummy)

export function useAudioContext() {
  return useContext(AudioContext)
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState<boolean>(dummy.muted)

  return (
    <AudioContext.Provider value={{ muted, setMuted }}>
      {children}
    </AudioContext.Provider>
  )
}

export function SoundController() {
  const { muted, setMuted } = useAudioContext()

  return (
    <button
      type="button"
      className="btn btn-ghost mx-auto bg-gray-100"
      onClick={() => setMuted(!muted)}
      aria-label="効果音のオン・オフ切り替え"
    >
      <span className="text-lg">効果音: {muted ? "OFF" : "ON"}</span>
      {muted ? (
        <SpeakerXMarkIcon className="size-8 text-red-500" />
      ) : (
        <SpeakerWaveIcon className="size-8 text-green-500" />
      )}
    </button>
  )
}
