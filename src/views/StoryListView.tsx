import { forwardRef, useEffect } from "react"
import type { ScrollBoxRenderable } from "@opentui/core"
import { StoryRow } from "../components/StoryRow"
import { Loader } from "../components/Loader"
import type { Item } from "../api/types"
import { useTheme } from "../theme"

interface Props {
  items: Item[]
  cursor: number
  loading: boolean
  onSelect: (idx: number) => void
  onActivate: (idx: number) => void
}

export const StoryListView = forwardRef<ScrollBoxRenderable, Props>(function StoryListView(
  { items, cursor, loading, onSelect, onActivate },
  ref,
) {
  const t = useTheme()
  useEffect(() => {
    const sb = (ref as React.RefObject<ScrollBoxRenderable>)?.current
    if (!sb || items.length === 0) return
    sb.scrollChildIntoView(`row-${cursor + 1}`)
  }, [cursor, items.length])

  if (items.length === 0) {
    return (
      <box flexGrow={1} flexDirection="column" alignItems="center" justifyContent="center" gap={1}>
        {loading ? (
          <>
            <Loader />
            <text fg={t.statusHint}>Loading stories…</text>
          </>
        ) : (
          <text fg={t.statusHint}>No stories</text>
        )}
      </box>
    )
  }

  return (
    <scrollbox
      ref={ref}
      flexGrow={1}
      scrollY={true}
      scrollX={false}
      verticalScrollbarOptions={{
        trackOptions: { backgroundColor: t.scrollTrack, foregroundColor: t.scrollThumb },
      }}
    >
      {items.map((item, idx) => (
        <StoryRow
          key={item.id}
          rank={idx + 1}
          item={item}
          selected={idx === cursor}
          onSelect={() => onSelect(idx)}
          onActivate={() => onActivate(idx)}
        />
      ))}
    </scrollbox>
  )
})
