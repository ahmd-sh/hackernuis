import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { SavedEntry } from "../utils/savedStore"
import { loadSaved, persistSaved } from "../utils/savedStore"

export function useSaved() {
  const [entries, setEntries] = useState<SavedEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const firstLoad = useRef(true)

  useEffect(() => {
    loadSaved().then((data) => {
      setEntries(data)
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    if (loaded) void persistSaved(entries)
  }, [entries, loaded])

  const idSet = useMemo(() => new Set(entries.map((e) => e.id)), [entries])

  const isSaved = useCallback((id: number) => idSet.has(id), [idSet])

  const toggle = useCallback((id: number) => {
    setEntries((prev) => {
      if (prev.some((e) => e.id === id)) return prev.filter((e) => e.id !== id)
      return [{ id, savedAt: Date.now() }, ...prev]
    })
  }, [])

  return { entries, idSet, isSaved, toggle, loaded }
}
