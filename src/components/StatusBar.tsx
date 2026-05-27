import { Loader } from "./Loader"
import { useTheme } from "../theme"

interface Props {
  view: "list" | "detail"
  loading?: boolean
  message?: string
}

export function StatusBar({ view, loading, message }: Props) {
  const t = useTheme()
  const hints =
    view === "list"
      ? "c/⏎ open · o link · r refresh · t theme · q quit"
      : "space collapse · o post link · ⏎ comment link(s) · h/esc back"
  return (
    <box
      flexDirection="row"
      flexShrink={0}
      height={2}
      paddingLeft={1}
      paddingRight={1}
      gap={1}
      alignItems="center"
      backgroundColor={t.strip}
      border={["top"]}
      borderStyle="single"
      borderColor={t.border}
    >
      {loading ? <Loader /> : null}
      <text fg={t.statusHint}>{message ?? hints}</text>
    </box>
  )
}
