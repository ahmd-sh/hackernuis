export type Category = "top" | "new" | "best" | "ask" | "show" | "job"

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "new", label: "New" },
  { key: "best", label: "Best" },
  { key: "ask", label: "Ask" },
  { key: "show", label: "Show" },
  { key: "job", label: "Jobs" },
]

export interface Item {
  id: number
  type: "story" | "comment" | "job" | "poll" | "pollopt"
  by?: string
  time?: number
  text?: string
  dead?: boolean
  deleted?: boolean
  parent?: number
  kids?: number[]
  url?: string
  score?: number
  title?: string
  descendants?: number
}
