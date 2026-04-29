import type React from "react"

// Spectator screen is rendered full-bleed (no app header / no horizontal padding),
// because the audience are guests/parents — not operators. We sit on top of the
// root layout's header & gutters using a fixed overlay so existing routes are
// not affected.
export default function SpectatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#000",
        zIndex: 60,
      }}
    >
      {children}
    </div>
  )
}
