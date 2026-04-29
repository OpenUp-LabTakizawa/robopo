"use client"

import { useEffect, useState } from "react"

// Generic banner overlay used by themes for "首位浮上！" / "NEW BEST" etc.
export function FxBanner({
  trigger,
  text,
  subtext,
  variant = "neon",
  duration = 2200,
}: {
  trigger: unknown
  text: string
  subtext?: string
  variant?: "neon" | "gold" | "kanji" | "glitch" | "arcade"
  duration?: number
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (trigger === null || trigger === undefined) {
      return
    }
    setVisible(true)
    const t = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(t)
  }, [trigger, duration])

  if (!visible) {
    return null
  }

  const variantStyle: React.CSSProperties = (() => {
    switch (variant) {
      case "gold":
        return {
          background:
            "linear-gradient(180deg, #ffd24a 0%, #ff8a00 60%, #ff5722 100%)",
          color: "#1a0e00",
          border: "4px solid #fff",
          textShadow: "0 2px 0 rgba(255,255,255,0.4)",
          fontFamily: '"Bebas Neue", "Noto Sans JP", sans-serif',
        }
      case "kanji":
        return {
          background:
            "linear-gradient(135deg, #ff2230 0%, #ffe14a 50%, #ff2230 100%)",
          color: "#fff",
          border: "6px solid #000",
          fontFamily: '"RocknRoll One", "Noto Sans JP", sans-serif',
          textShadow: "4px 4px 0 #000",
        }
      case "glitch":
        return {
          background: "rgba(8,1,15,0.9)",
          color: "#ff2bd6",
          border: "2px solid #00fff0",
          fontFamily: '"Orbitron", monospace',
          textShadow: "2px 0 #00fff0, -2px 0 #ffe14a",
        }
      case "arcade":
        return {
          background: "#0a0e2c",
          color: "#ffe14a",
          border: "4px solid #ffe14a",
          fontFamily: '"Press Start 2P", monospace',
          textShadow: "3px 3px 0 #ff2bd6",
          boxShadow: "0 0 0 4px #34d651",
        }
      default:
        return {
          background: "rgba(0,0,0,0.85)",
          color: "#00e0ff",
          border: "3px solid #00e0ff",
          fontFamily: '"Orbitron", "Noto Sans JP", sans-serif',
          textShadow: "0 0 24px #00e0ff",
        }
    }
  })()

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
      style={{
        animation: `spectator-banner-pop ${duration}ms ease-out forwards`,
      }}
    >
      <div
        style={{
          ...variantStyle,
          padding: "24px 56px",
          minWidth: 480,
          textAlign: "center",
          transform: "rotate(-2deg)",
          letterSpacing: 4,
        }}
      >
        <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>
          {text}
        </div>
        {subtext && (
          <div
            style={{
              fontSize: 20,
              marginTop: 12,
              letterSpacing: 6,
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  )
}
