"use client"

import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline"
import type React from "react"
import { createContext, useContext, useState } from "react"

export type AudioContextType = {
  soundOn: boolean
  setSoundOn: React.Dispatch<React.SetStateAction<boolean>>
}

const dummy: AudioContextType = {
  soundOn: false,
  setSoundOn: () => {
    throw new Error("setSoundOn called outside of AudioContext provider")
  },
}

const AudioContext = createContext<AudioContextType>(dummy)

export function useAudioContext() {
  return useContext(AudioContext)
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState<boolean>(dummy.soundOn)

  return (
    <AudioContext.Provider value={{ soundOn, setSoundOn }}>
      {children}
    </AudioContext.Provider>
  )
}

export function SoundControlUI({
  soundOn,
  setSoundOn,
}: {
  soundOn: boolean
  setSoundOn: React.Dispatch<React.SetStateAction<boolean>>
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {soundOn ? (
        <SpeakerWaveIcon className="size-8 text-green-500" />
      ) : (
        <SpeakerXMarkIcon className="size-8 text-red-500" />
      )}
      <span className="text-lg">効果音: {soundOn ? "ON" : "OFF"}</span>
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={soundOn}
          onChange={(e) => setSoundOn(e.target.checked)}
          className="toggle toggle-success"
        />
        <span className="sr-only">効果音のオン・オフ切り替え</span>
      </label>
    </div>
  )
}
