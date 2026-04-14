// Shared sort label factories for summary tables

export function makeSortLabel<K extends string>(
  options: { value: K; label: string }[],
): (key: K) => string {
  return (key) => options.find((o) => o.value === key)?.label ?? key
}

export function makeOrderLabel<K extends string>(
  nameKeys: Set<K>,
  timeKeys: Set<K>,
): (key: K, order: "asc" | "desc") => string {
  return (key, order) => {
    if (nameKeys.has(key)) {
      return order === "desc" ? "Z→A" : "A→Z"
    }
    if (timeKeys.has(key)) {
      return order === "desc" ? "新しい順" : "古い順"
    }
    return order === "desc" ? "大きい順" : "小さい順"
  }
}
