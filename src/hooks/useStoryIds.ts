import { useEffect, useState } from "react"
import { fetchIds } from "../api/hn"
import type { Category } from "../api/types"

export function useStoryIds(category: Category, refreshKey = 0) {
  const [ids, setIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIds([])
    setLoading(true)
    setError(null)
    fetchIds(category)
      .then((data) => {
        if (!cancelled) {
          setIds(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [category, refreshKey])

  return { ids, loading, error }
}
