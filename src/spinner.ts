// Adapted from opentui-spinner (MIT) — examples/knight-rider/utils.ts by Matt Simpson
import type { ColorInput } from "@opentui/core"
import { RGBA } from "@opentui/core"
import type { ColorGenerator } from "opentui-spinner"

interface AdvancedGradientOptions {
  colors: ColorInput[]
  trailLength: number
  defaultColor?: ColorInput
  direction?: "forward" | "backward" | "bidirectional"
  holdFrames?: { start?: number; end?: number }
}

interface ScannerState {
  activePosition: number
  isHolding: boolean
  holdProgress: number
  holdTotal: number
  movementProgress: number
  movementTotal: number
  isMovingForward: boolean
}

function getScannerState(
  frameIndex: number,
  totalChars: number,
  options: Pick<AdvancedGradientOptions, "direction" | "holdFrames">,
): ScannerState {
  const { direction = "forward", holdFrames = {} } = options

  if (direction === "bidirectional") {
    const forwardFrames = totalChars
    const holdEndFrames = holdFrames.end ?? 0
    const backwardFrames = totalChars - 1

    if (frameIndex < forwardFrames) {
      return {
        activePosition: frameIndex,
        isHolding: false,
        holdProgress: 0,
        holdTotal: 0,
        movementProgress: frameIndex,
        movementTotal: forwardFrames,
        isMovingForward: true,
      }
    } else if (frameIndex < forwardFrames + holdEndFrames) {
      return {
        activePosition: totalChars - 1,
        isHolding: true,
        holdProgress: frameIndex - forwardFrames,
        holdTotal: holdEndFrames,
        movementProgress: 0,
        movementTotal: 0,
        isMovingForward: true,
      }
    } else if (frameIndex < forwardFrames + holdEndFrames + backwardFrames) {
      const backwardIndex = frameIndex - forwardFrames - holdEndFrames
      return {
        activePosition: totalChars - 2 - backwardIndex,
        isHolding: false,
        holdProgress: 0,
        holdTotal: 0,
        movementProgress: backwardIndex,
        movementTotal: backwardFrames,
        isMovingForward: false,
      }
    } else {
      return {
        activePosition: 0,
        isHolding: true,
        holdProgress: frameIndex - forwardFrames - holdEndFrames - backwardFrames,
        holdTotal: holdFrames.start ?? 0,
        movementProgress: 0,
        movementTotal: 0,
        isMovingForward: false,
      }
    }
  } else if (direction === "backward") {
    return {
      activePosition: totalChars - 1 - (frameIndex % totalChars),
      isHolding: false,
      holdProgress: 0,
      holdTotal: 0,
      movementProgress: frameIndex % totalChars,
      movementTotal: totalChars,
      isMovingForward: false,
    }
  } else {
    return {
      activePosition: frameIndex % totalChars,
      isHolding: false,
      holdProgress: 0,
      holdTotal: 0,
      movementProgress: frameIndex % totalChars,
      movementTotal: totalChars,
      isMovingForward: true,
    }
  }
}

function calculateColorIndex(
  frameIndex: number,
  charIndex: number,
  totalChars: number,
  options: Pick<AdvancedGradientOptions, "direction" | "holdFrames" | "trailLength">,
): number {
  const { trailLength } = options
  const { activePosition, isHolding, holdProgress, isMovingForward } = getScannerState(
    frameIndex,
    totalChars,
    options,
  )

  const directionalDistance = isMovingForward ? activePosition - charIndex : charIndex - activePosition

  if (isHolding) {
    return directionalDistance + holdProgress
  }

  if (directionalDistance > 0 && directionalDistance < trailLength) {
    return directionalDistance
  }

  if (directionalDistance === 0) {
    return 0
  }

  return -1
}

function createKnightRiderTrail(options: AdvancedGradientOptions): ColorGenerator {
  const { colors, defaultColor } = options

  const defaultRgba =
    defaultColor instanceof RGBA ? defaultColor : RGBA.fromHex((defaultColor as string) || "#000000")

  return (frameIndex: number, charIndex: number, _totalFrames: number, totalChars: number) => {
    const index = calculateColorIndex(frameIndex, charIndex, totalChars, options)

    const { isHolding, holdProgress, holdTotal, movementProgress, movementTotal } = getScannerState(
      frameIndex,
      totalChars,
      options,
    )

    let alpha = 1.0
    if (isHolding && holdTotal > 0) {
      const progress = Math.min(holdProgress / holdTotal, 1)
      alpha = Math.max(0, 1 - progress)
    } else if (!isHolding && movementTotal > 0) {
      const progress = Math.min(movementProgress / Math.max(1, movementTotal - 1), 1)
      alpha = progress
    }

    defaultRgba.a = alpha

    if (index === -1) {
      return defaultRgba
    }

    return colors[index] ?? defaultRgba
  }
}

export type KnightRiderStyle = "blocks" | "diamonds"

export interface KnightRiderOptions {
  width?: number
  style?: KnightRiderStyle
  holdStart?: number
  holdEnd?: number
  colors?: ColorInput[]
  defaultColor?: ColorInput
}

export function createFrames(options: KnightRiderOptions = {}): string[] {
  const width = options.width ?? 8
  const style = options.style ?? "diamonds"
  const holdStart = options.holdStart ?? 30
  const holdEnd = options.holdEnd ?? 9

  const colors = options.colors ?? [
    RGBA.fromHex("#ff0000"),
    RGBA.fromHex("#ff5555"),
    RGBA.fromHex("#dd0000"),
    RGBA.fromHex("#aa0000"),
    RGBA.fromHex("#770000"),
    RGBA.fromHex("#440000"),
  ]

  const trailOptions = {
    colors,
    trailLength: colors.length,
    defaultColor: options.defaultColor ?? RGBA.fromHex("#330000"),
    direction: "bidirectional" as const,
    holdFrames: { start: holdStart, end: holdEnd },
  }

  const totalFrames = width + holdEnd + (width - 1) + holdStart

  const frames = Array.from({ length: totalFrames }, (_, frameIndex) => {
    return Array.from({ length: width }, (_, charIndex) => {
      const index = calculateColorIndex(frameIndex, charIndex, width, trailOptions)

      if (style === "diamonds") {
        const shapes = ["⬥", "◆", "⬩", "⬪"]
        if (index >= 0 && index < trailOptions.colors.length) {
          return shapes[Math.min(index, shapes.length - 1)]
        }
        return "·"
      }

      const isActive = index >= 0 && index < trailOptions.colors.length
      return isActive ? "■" : "⬝"
    }).join("")
  })

  return frames
}

export function createColors(options: KnightRiderOptions = {}): ColorGenerator {
  const holdStart = options.holdStart ?? 30
  const holdEnd = options.holdEnd ?? 9

  const colors = options.colors ?? [
    RGBA.fromHex("#ff0000"),
    RGBA.fromHex("#ff5555"),
    RGBA.fromHex("#dd0000"),
    RGBA.fromHex("#aa0000"),
    RGBA.fromHex("#770000"),
    RGBA.fromHex("#440000"),
  ]

  const trailOptions = {
    colors,
    trailLength: colors.length,
    defaultColor: options.defaultColor ?? RGBA.fromHex("#330000"),
    direction: "bidirectional" as const,
    holdFrames: { start: holdStart, end: holdEnd },
  }

  return createKnightRiderTrail(trailOptions)
}
