"use client"

import { useEffect, useState } from "react"

type Particle = {
  id: number
  dx: number
  dy: number
  size: number
  color: string
  rot: number
}

export function ParticleBurst({
  trigger,
  count = 24,
  colors = ["#fff", "#ffe14a", "#00e0ff", "#ff2bd6"],
  spread = 380,
  ttl = 1300,
}: {
  trigger: unknown
  count?: number
  colors?: string[]
  spread?: number
  ttl?: number
}) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger === null || trigger === undefined) {
      return
    }
    const burst: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist = spread * (0.4 + Math.random() * 0.6)
      return {
        id: Date.now() + i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        size: 8 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
      }
    })
    setParticles(burst)
    const t = setTimeout(() => setParticles([]), ttl)
    return () => clearTimeout(t)
  }, [trigger, count, colors, spread, ttl])

  if (particles.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      {particles.map((p) => (
        <span
          key={p.id}
          style={
            {
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: "2px",
              transform: `translate(0px, 0px) rotate(${p.rot}deg)`,
              animation: `spectator-particle-fly ${ttl}ms cubic-bezier(0.16,1,0.3,1) forwards`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--rot": `${p.rot + 540}deg`,
              boxShadow: `0 0 12px ${p.color}`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
