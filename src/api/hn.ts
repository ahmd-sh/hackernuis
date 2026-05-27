import type { Category, Item } from "./types"

const BASE = "https://hacker-news.firebaseio.com/v0"
const cache = new Map<number, Item>()
const inflight = new Map<number, Promise<Item>>()

export async function fetchIds(category: Category): Promise<number[]> {
  const res = await fetch(`${BASE}/${category}stories.json`)
  if (!res.ok) throw new Error(`HN ${category} ${res.status}`)
  const ids = (await res.json()) as number[] | null
  return ids ?? []
}

export async function fetchItem(id: number): Promise<Item> {
  const hit = cache.get(id)
  if (hit) return hit
  const pending = inflight.get(id)
  if (pending) return pending
  const p = (async () => {
    const res = await fetch(`${BASE}/item/${id}.json`)
    if (!res.ok) throw new Error(`HN item ${id} ${res.status}`)
    const item = (await res.json()) as Item
    cache.set(id, item)
    inflight.delete(id)
    return item
  })()
  inflight.set(id, p)
  return p
}

export async function fetchItems(ids: number[], concurrency = 10): Promise<Item[]> {
  const out: Item[] = new Array(ids.length)
  let i = 0
  const workers = Array.from({ length: Math.min(concurrency, ids.length) }, async () => {
    while (true) {
      const idx = i++
      if (idx >= ids.length) return
      try {
        out[idx] = await fetchItem(ids[idx]!)
      } catch {
        // leave undefined; caller filters
      }
    }
  })
  await Promise.all(workers)
  return out.filter((x): x is Item => Boolean(x))
}
