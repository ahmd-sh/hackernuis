import { RGBA } from "@opentui/core"
import { createColors, createFrames } from "../spinner"

const HN_ORANGE_RAMP = [
  RGBA.fromHex("#ff6600"),
  RGBA.fromHex("#ffaa66"),
  RGBA.fromHex("#dd5500"),
  RGBA.fromHex("#aa4400"),
  RGBA.fromHex("#773300"),
  RGBA.fromHex("#442200"),
]

const HN_INACTIVE = RGBA.fromHex("#2a1500")

const OPTIONS = {
  style: "blocks" as const,
  colors: HN_ORANGE_RAMP,
  defaultColor: HN_INACTIVE,
}

const FRAMES = createFrames(OPTIONS)
const COLOR = createColors(OPTIONS)

interface Props {
  interval?: number
}

export function Loader({ interval = 40 }: Props) {
  return <spinner frames={FRAMES} color={COLOR} interval={interval} />
}
