import { homedir } from "os"
import { join } from "path"
import { mkdirSync } from "fs"

export interface SavedEntry {
  id: number
  savedAt: number
}

const CONFIG_DIR = join(homedir(), ".config", "hackernuis")
const SAVED_PATH = join(CONFIG_DIR, "saved.json")

export async function loadSaved(): Promise<SavedEntry[]> {
  try {
    const file = Bun.file(SAVED_PATH)
    if (!(await file.exists())) return []
    const data = await file.json()
    if (!Array.isArray(data)) return []
    return data.filter(
      (e): e is SavedEntry =>
        e && typeof e.id === "number" && typeof e.savedAt === "number",
    )
  } catch {
    return []
  }
}

export async function persistSaved(entries: SavedEntry[]): Promise<void> {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true })
    await Bun.write(SAVED_PATH, JSON.stringify(entries, null, 2))
  } catch {
    // fail silently — saved state is best-effort
  }
}
