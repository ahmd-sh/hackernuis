import { TextAttributes } from "@opentui/core"
import type { Category } from "../api/types"
import { CATEGORIES } from "../api/types"
import { useTheme } from "../theme"

interface Props {
  category: Category
  onSelect: (c: Category) => void
  showTabs?: boolean
}

export function Header({ category, onSelect, showTabs = true }: Props) {
  const t = useTheme()
  return (
    <box
      flexDirection="column"
      flexShrink={0}
      height={showTabs ? 5 : 3}
      paddingTop={1}
      paddingLeft={1}
      paddingRight={1}
      backgroundColor={t.strip}
      border={["bottom"]}
      borderStyle="single"
      borderColor={t.border}
    >
      <box flexDirection="row" flexShrink={0} height={1} alignItems="center" gap={2}>
        <text bg={t.brandTileBg} fg={t.brandTileFg} attributes={TextAttributes.BOLD}>
          {" Y "}
        </text>
        <text fg={t.brandText} attributes={TextAttributes.BOLD}>
          HackerNews
        </text>
        <text fg={t.brandSubtle}>· TUI</text>
      </box>
      {showTabs ? (
        <box flexDirection="row" flexShrink={0} height={1} marginTop={1} gap={1}>
          {CATEGORIES.map((c, i) => {
            const active = c.key === category
            return (
              <box
                key={c.key}
                flexShrink={0}
                onMouseDown={() => onSelect(c.key)}
                backgroundColor={active ? t.tabActiveBg : undefined}
              >
                <text fg={active ? t.tabActiveFg : t.tabInactiveFg}>
                  {` ${i + 1} ${c.label} `}
                </text>
              </box>
            )
          })}
        </box>
      ) : null}
    </box>
  )
}
