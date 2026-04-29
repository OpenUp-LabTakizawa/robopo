"use client"

export type TickerItem = {
  id: string | number
  text: string
}

export function Ticker({
  items,
  speed = 90,
  bg = "#000",
  color = "#fff",
  accentColor = "#00e0ff",
  height = 36,
}: {
  items: TickerItem[]
  speed?: number
  bg?: string
  color?: string
  accentColor?: string
  height?: number
}) {
  if (items.length === 0) {
    return null
  }
  // Duplicate items for seamless loop.
  const loop = [...items, ...items]
  return (
    <div
      style={{
        background: bg,
        color,
        height,
        overflow: "hidden",
        position: "relative",
        borderTop: `1px solid ${accentColor}`,
        borderBottom: `1px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          gap: 48,
          whiteSpace: "nowrap",
          alignItems: "center",
          height: "100%",
          paddingLeft: 24,
          animation: `spectator-ticker-scroll ${Math.max(20, items.length * speed) / 4}s linear infinite`,
        }}
      >
        {loop.map((item, idx) => (
          <span
            key={`${item.id}-${idx < items.length ? "a" : "b"}`}
            style={{
              fontSize: 14,
              letterSpacing: 1,
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            <span style={{ color: accentColor, marginRight: 8 }}>●</span>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  )
}
