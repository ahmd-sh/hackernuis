import { useEffect, useState } from "react"
import { fetchItem } from "../api/hn"
import type { Item } from "../api/types"

export interface CommentNode {
  item: Item
  children: CommentNode[]
}

export interface FlatComment {
  node: CommentNode
  depth: number
  hiddenChildren: number
}

async function loadTree(id: number, depth: number, maxDepth: number): Promise<CommentNode | null> {
  const item = await fetchItem(id).catch(() => null)
  if (!item || item.deleted || item.dead) return null
  const kidIds = item.kids ?? []
  let children: CommentNode[] = []
  if (depth < maxDepth && kidIds.length > 0) {
    const loaded = await Promise.all(kidIds.map((kid) => loadTree(kid, depth + 1, maxDepth)))
    children = loaded.filter((x): x is CommentNode => x !== null)
  }
  return { item, children }
}

export function useCommentTree(rootIds: number[] | undefined, maxDepth = 8) {
  const [tree, setTree] = useState<CommentNode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!rootIds || rootIds.length === 0) {
      setTree([])
      return
    }
    let cancelled = false
    setTree([])
    setLoading(true)
    Promise.all(rootIds.map((id) => loadTree(id, 0, maxDepth))).then((nodes) => {
      if (!cancelled) {
        setTree(nodes.filter((x): x is CommentNode => x !== null))
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [rootIds?.join(","), maxDepth])

  return { tree, loading }
}

export function flattenTree(tree: CommentNode[], collapsed: Set<number>): FlatComment[] {
  const out: FlatComment[] = []
  const walk = (nodes: CommentNode[], depth: number) => {
    for (const node of nodes) {
      const isCollapsed = collapsed.has(node.item.id)
      const hidden = isCollapsed ? countAll(node) : 0
      out.push({ node, depth, hiddenChildren: hidden })
      if (!isCollapsed) walk(node.children, depth + 1)
    }
  }
  walk(tree, 0)
  return out
}

function countAll(node: CommentNode): number {
  let n = node.children.length
  for (const c of node.children) n += countAll(c)
  return n
}
