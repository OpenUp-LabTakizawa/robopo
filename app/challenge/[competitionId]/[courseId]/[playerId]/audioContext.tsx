"use client"

import React, { createContext, useContext, useState } from "react"
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline"

export type AudioContextType = {
    soundOn: boolean,
    setSoundOn: React.Dispatch<React.SetStateAction<boolean>>,
}

const dummy: AudioContextType = {
    soundOn: false,
    setSoundOn: () => {
        throw new Error("setSoundOn called outside of AudioContext provider");
    },
}

const AudioContext = createContext<AudioContextType>(dummy)

export const useAudioContext = () => useContext(AudioContext)

export function AudioProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [soundOn, setSoundOn] = useState<boolean>(dummy.soundOn)

    return (
        <AudioContext.Provider value={{ soundOn, setSoundOn }}>
            {children}
        </AudioContext.Provider>
    )
}

export const SoundControlUI = ({
    soundOn,
    setSoundOn,
}: {
    soundOn: boolean,
    setSoundOn: React.Dispatch<React.SetStateAction<boolean>>,
}) => {
    return (
        <div className="flex items-center justify-center gap-2">
            {soundOn ? (
                <SpeakerWaveIcon className="w-8 h-8 text-green-500" />
            ) : (
                <SpeakerXMarkIcon className="w-8 h-8 text-red-500" />
            )}
            <span className="text-lg">効果音: {soundOn ? "ON" : "OFF"}</span>
            <input type="checkbox" checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} className="toggle toggle-success" />
        </div>
    )
}