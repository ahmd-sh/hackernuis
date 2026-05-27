import { useEffect, useState } from "react"
import { fetchItems } from "../api/hn"
import type { Item } from "../api/types"

export function useItems(ids: number[]) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ids.length === 0) {
      setItems([])
      return
    }
    let cancelled = false
    setItems([])
    setLoading(true)
    fetchItems(ids).then((data) => {
      if (!cancelled) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [ids.join(",")])

  return { items, loading }
}
