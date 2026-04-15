import type { PointState } from "@/lib/course/types"

// Convert PointState to String
// Single values: number, Tier values: (n1,n2,n3,...)
export function serializePoint(pointState: PointState): string {
  return pointState
    .map((entry) => {
      if (entry === null) {
        return "null"
      }
      if (Array.isArray(entry)) {
        return `(${entry.join(",")})`
      }
      return String(entry)
    })
    .join(";")
}

// Convert String to PointState
export function deserializePoint(str: string | null): PointState {
  if (!str) {
    return []
  }
  const result: PointState = []
  // Parse with support for (...) tier format
  let i = 0
  const parts: string[] = []
  let current = ""
  let inParens = false
  for (i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === "(" && !inParens) {
      inParens = true
      current += ch
    } else if (ch === ")" && inParens) {
      inParens = false
      current += ch
    } else if (ch === ";" && !inParens) {
      parts.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  if (current) {
    parts.push(current)
  }

  for (const part of parts) {
    if (part === "null") {
      result.push(null)
    } else if (part.startsWith("(") && part.endsWith(")")) {
      // Tier: (20,10,5,3,0,-5)
      const inner = part.slice(1, -1)
      result.push(inner.split(",").map(Number))
    } else {
      result.push(Number(part))
    }
  }
  return result
}
