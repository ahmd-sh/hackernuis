import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import "opentui-spinner/react"
import { App } from "./App"

const renderer = await createCliRenderer({ useMouse: true })
createRoot(renderer).render(<App />)
