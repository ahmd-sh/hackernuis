import { useEffect, useMemo, useRef, useState } from "react"
import type { ScrollBoxRenderable } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { Header } from "./components/Header"
import { StatusBar } from "./components/StatusBar"
import { StoryListView } from "./views/StoryListView"
import { StoryDetailView } from "./views/StoryDetailView"
import { useStoryIds } from "./hooks/useStoryIds"
import { useItems } from "./hooks/useItems"
import { flattenTree, useCommentTree } from "./hooks/useCommentTree"
import { CATEGORIES } from "./api/types"
import type { Category, Item } from "./api/types"
import { openUrl } from "./utils/openUrl"
import { extractLinks, type Link } from "./utils/format"
import { LinksPopup } from "./components/LinksPopup"
import { ThemeContext, darkTheme, lightTheme } from "./theme"

const PAGE_SIZE = 30

type View = { kind: "list" } | { kind: "detail"; story: Item }

export function App() {
  const renderer = useRenderer()
  const [category, setCategory] = useState<Category>("top")
  const [refreshKey, setRefreshKey] = useState(0)
  const { ids, loading: idsLoading } = useStoryIds(category, refreshKey)
  const visibleIds = useMemo(() => ids.slice(0, PAGE_SIZE), [ids])
  const { items, loading: itemsLoading } = useItems(visibleIds)

  const [view, setView] = useState<View>({ kind: "list" })
  const [listCursor, setListCursor] = useState(0)
  const [detailCursor, setDetailCursor] = useState(0)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [theme, setTheme] = useState(darkTheme)
  const [popup, setPopup] = useState<{ links: Link[]; cursor: number } | null>(null)
  const lastG = useRef<number>(0)
  const listScrollRef = useRef<ScrollBoxRenderable | null>(null)
  const detailScrollRef = useRef<ScrollBoxRenderable | null>(null)

  const story = view.kind === "detail" ? view.story : null
  const { tree, loading: commentsLoading } = useCommentTree(story?.kids)
  const flat = useMemo(() => flattenTree(tree, collapsed), [tree, collapsed])

  useEffect(() => {
    if (listCursor >= items.length) setListCursor(Math.max(0, items.length - 1))
  }, [items.length])

  useEffect(() => {
    if (detailCursor >= flat.length) setDetailCursor(Math.max(0, flat.length - 1))
  }, [flat.length])

  useEffect(() => {
    if (popup) {
      detailScrollRef.current?.blur()
      listScrollRef.current?.blur()
    }
  }, [popup])

  const switchCategory = (c: Category) => {
    setCategory(c)
    setListCursor(0)
  }

  const cycleCategory = (dir: 1 | -1) => {
    const idx = CATEGORIES.findIndex((c) => c.key === category)
    const next = CATEGORIES[(idx + dir + CATEGORIES.length) % CATEGORIES.length]!
    switchCategory(next.key)
  }

  const enterDetail = (item: Item) => {
    setView({ kind: "detail", story: item })
    setDetailCursor(0)
    setCollapsed(new Set())
  }

  const exitDetail = () => setView({ kind: "list" })

  const openLinksFor = (id: number) => {
    const fc = flat.find((f) => f.node.item.id === id)
    if (!fc) return
    const links = extractLinks(fc.node.item.text)
    if (links.length > 0) setPopup({ links, cursor: 0 })
  }

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const pageSize = (kind: "list" | "detail") => {
    const sb = kind === "list" ? listScrollRef.current : detailScrollRef.current
    const rowApprox = kind === "list" ? 2 : 4
    return Math.max(1, Math.floor((sb?.viewport.height ?? 20) / rowApprox))
  }

  useKeyboard((ev) => {
    const name = ev.name
    if (name === "q" || (ev.ctrl && name === "c")) {
      renderer?.destroy()
      process.exit(0)
    }

    if (popup) {
      const max = popup.links.length - 1
      if (name === "j" || name === "down") {
        setPopup((p) => (p ? { ...p, cursor: Math.min(max, p.cursor + 1) } : p))
      } else if (name === "k" || name === "up") {
        setPopup((p) => (p ? { ...p, cursor: Math.max(0, p.cursor - 1) } : p))
      } else if (name === "g") {
        setPopup((p) => (p ? { ...p, cursor: 0 } : p))
      } else if (name === "G") {
        setPopup((p) => (p ? { ...p, cursor: max } : p))
      } else if (name === "o" || name === "return" || name === "enter") {
        const link = popup.links[popup.cursor]
        if (link) openUrl(link.url)
      } else if (name === "escape" || name === "backspace") {
        setPopup(null)
      }
      return
    }

    if (name === "t") {
      setTheme((cur) => (cur.name === "dark" ? lightTheme : darkTheme))
      return
    }

    if (view.kind === "list") {
      const max = items.length - 1
      const pg = pageSize("list")
      if (name === "j" || name === "down") {
        setListCursor((c) => Math.min(max, c + 1))
      } else if (name === "k" || name === "up") {
        setListCursor((c) => Math.max(0, c - 1))
      } else if (name === "g") {
        const now = Date.now()
        if (now - lastG.current < 500) setListCursor(0)
        lastG.current = now
      } else if (name === "G") {
        setListCursor(max)
      } else if ((ev.ctrl && name === "d") || name === "pagedown") {
        setListCursor((c) => Math.min(max, c + pg))
      } else if ((ev.ctrl && name === "u") || name === "pageup") {
        setListCursor((c) => Math.max(0, c - pg))
      } else if (name === "c" || name === "return" || name === "enter") {
        const cur = items[listCursor]
        if (cur) enterDetail(cur)
      } else if (name === "h" || name === "left") {
        cycleCategory(-1)
      } else if (name === "l" || name === "right") {
        cycleCategory(1)
      } else if (name === "tab") {
        cycleCategory(ev.shift ? -1 : 1)
      } else if (name === "o") {
        const cur = items[listCursor]
        if (cur?.url) openUrl(cur.url)
      } else if (/^[1-6]$/.test(name)) {
        const c = CATEGORIES[parseInt(name, 10) - 1]
        if (c) switchCategory(c.key)
      } else if (name === "r") {
        setRefreshKey((k) => k + 1)
      }
    } else {
      const max = flat.length - 1
      const pg = pageSize("detail")
      if (name === "j" || name === "down") {
        setDetailCursor((c) => Math.min(max, c + 1))
      } else if (name === "k" || name === "up") {
        setDetailCursor((c) => Math.max(0, c - 1))
      } else if (name === "g") {
        const now = Date.now()
        if (now - lastG.current < 500) setDetailCursor(0)
        lastG.current = now
      } else if (name === "G") {
        setDetailCursor(max)
      } else if ((ev.ctrl && name === "d") || name === "pagedown") {
        setDetailCursor((c) => Math.min(max, c + pg))
      } else if ((ev.ctrl && name === "u") || name === "pageup") {
        setDetailCursor((c) => Math.max(0, c - pg))
      } else if (name === "space") {
        const cur = flat[detailCursor]
        if (cur) toggleCollapse(cur.node.item.id)
      } else if (name === "return" || name === "enter") {
        const cur = flat[detailCursor]
        if (cur) openLinksFor(cur.node.item.id)
      } else if (name === "o") {
        if (view.story.url) openUrl(view.story.url)
      } else if (name === "h" || name === "left" || name === "backspace" || name === "escape") {
        exitDetail()
      }
    }
  })

  const loading = view.kind === "list" ? idsLoading || itemsLoading : commentsLoading

  return (
    <ThemeContext.Provider value={theme}>
    <box flexDirection="column" flexGrow={1}>
      <Header
        category={category}
        onSelect={switchCategory}
        onHome={() => {
          setView({ kind: "list" })
          switchCategory("top")
        }}
        showTabs={view.kind === "list"}
      />
      <box flexGrow={1} flexDirection="column" backgroundColor={theme.body}>
        {view.kind === "list" ? (
          <StoryListView
            key={category}
            ref={listScrollRef}
            items={items}
            cursor={listCursor}
            loading={loading}
            onSelect={setListCursor}
            onActivate={(idx) => {
              const cur = items[idx]
              if (cur) enterDetail(cur)
            }}
          />
        ) : (
          <StoryDetailView
            key={view.story.id}
            ref={detailScrollRef}
            story={view.story}
            flat={flat}
            cursor={detailCursor}
            collapsed={collapsed}
            loading={loading}
            onSelectComment={setDetailCursor}
            onToggleComment={toggleCollapse}
            onOpenLinks={openLinksFor}
          />
        )}
      </box>
      <StatusBar view={view.kind} loading={loading} />
      {popup ? (
        <LinksPopup
          links={popup.links}
          cursor={popup.cursor}
          onSelect={(idx) => setPopup((p) => (p ? { ...p, cursor: idx } : p))}
          onActivate={(idx) => {
            const link = popup.links[idx]
            if (link) openUrl(link.url)
          }}
          onClose={() => setPopup(null)}
        />
      ) : null}
    </box>
    </ThemeContext.Provider>
  )
}
