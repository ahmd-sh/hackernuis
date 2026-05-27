import { TextAttributes } from "@opentui/core"
import type { Item } from "../api/types"
import { hostname, relativeTime } from "../utils/format"
import { useTheme } from "../theme"

interface Props {
  rank: number
  item: Item
  selected: boolean
  onSelect: () => void
  onActivate: () => void
}

export function StoryRow({ rank, item, selected, onSelect, onActivate }: Props) {
  const t = useTheme()
  const host = hostname(item.url)
  const title = item.title ?? "(untitled)"
  const score = item.score ?? 0
  const author = item.by ?? "?"
  const age = relativeTime(item.time)
  const comments = item.descendants ?? 0
  const bg = selected ? t.rowHighlight : undefined
  const titleFg = selected ? t.text : t.textBody
  const rankFg = selected ? t.accent : t.textDim

  let lastClick = 0
  const handleClick = () => {
    const now = Date.now()
    if (selected || now - lastClick < 400) {
      onActivate()
    } else {
      onSelect()
    }
    lastClick = now
  }

  return (
    <box
      id={`row-${rank}`}
      flexDirection="column"
      paddingLeft={1}
      paddingRight={1}
      backgroundColor={bg}
      onMouseDown={handleClick}
    >
      <text>
        <span fg={rankFg}>{`${String(rank).padStart(3, " ")}. `}</span>
        <span fg={titleFg} attributes={selected ? TextAttributes.BOLD : TextAttributes.NONE}>
          {title}
        </span>
        {host ? <span fg={t.textDim}>{` (${host})`}</span> : null}
      </text>
      <text>
        <span fg={t.textDim}>     </span>
        <span fg={t.accent}>▲ {score}</span>
        <span fg={t.textDim}>{`  by `}</span>
        <span fg={t.textMuted}>{author}</span>
        <span fg={t.textDim}>{`  ${age}  | `}</span>
        <span fg={t.textMuted}>{`${comments} comment${comments === 1 ? "" : "s"}`}</span>
      </text>
    </box>
  )
}
