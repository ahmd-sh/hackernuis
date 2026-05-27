# hackernuis

> A beautiful Hacker News browser for the terminal — built on [OpenTUI](https://github.com/anomalyco/opentui) + React + [Bun](https://bun.sh).

Browse the front page, drill into stories, read full collapsible comment threads, and open links — without leaving the terminal.

```
bun add -g @ahmd-sh/hackernuis
hackernuis
```

## Features

- **Six feeds**: Top, New, Best, Ask, Show, Jobs — switch with one keystroke or click
- **Threaded comments**: full nested tree, collapse/expand subtrees, depth-colored indentation
- **Link extraction**: pop up all links in a comment, navigate, open in browser
- **Vim, arrow, and mouse navigation** — all work simultaneously
- **Dark / light themes** — light theme faithful to HN's classic palette
- **Knight Rider loading scanner** in HN orange
- **Fast**: in-memory cache, concurrent comment fetching, near-instant tab switches

## Requirements

- **[Bun](https://bun.sh) ≥ 1.2** — `curl -fsSL https://bun.sh/install | bash`
- A modern terminal with truecolor, mouse, and UTF-8 support (iTerm2, WezTerm, Kitty, Ghostty, Alacritty, Terminal.app — all good)
- macOS / Linux. Windows is supported by OpenTUI but untested.

## Install

```bash
bun add -g @ahmd-sh/hackernuis
```

Or run without installing:

```bash
bunx @ahmd-sh/hackernuis
```

## Run

```bash
hackernuis
```

Quit with `q` (or `Ctrl-C`).

## Keybindings

### Story list

| Key | Action |
|---|---|
| `j` / `↓` · `k` / `↑` | Move cursor |
| `gg` · `G` | First / last |
| `Ctrl-D` · `Ctrl-U` · `PgDown` · `PgUp` | Half-page |
| `c` · `Enter` | Open story (read comments) |
| `h` / `←` · `l` / `→` | Previous / next tab |
| `Tab` · `Shift-Tab` | Cycle tabs |
| `1` – `6` | Jump to category |
| `o` | Open story URL in browser |
| `r` | Refresh feed |
| `t` | Toggle theme |
| `q` · `Ctrl-C` | Quit |

### Story detail (comments)

| Key | Action |
|---|---|
| `j` / `↓` · `k` / `↑` | Move comment cursor |
| `gg` · `G` | First / last |
| `Ctrl-D` · `Ctrl-U` · `PgDown` · `PgUp` | Half-page |
| `Space` | Collapse / expand subtree |
| `Enter` | Open links popup (if comment has any) |
| `o` | Open story URL |
| `Esc` · `Backspace` · `h` / `←` | Back to list |
| `t` | Toggle theme |
| `q` | Quit |

### Links popup

| Key | Action |
|---|---|
| `j` · `k` · `↑` · `↓` | Move |
| `gg` · `G` | First / last |
| `o` · `Enter` | Open link |
| `Esc` · `Backspace` | Close |

### Mouse

- Click a **tab** to switch feeds
- Click the **`Y` tile** to jump home (Top tab)
- Click a **story row** to select; click the selected row again to open
- Click a **comment header** to toggle collapse
- **Double-click** a comment body to open its links popup
- Click the **story URL** in detail header to open in browser
- Click outside the **links popup** to close it
- **Scroll wheel** to scroll lists and comments

### Selecting & copying text

Mouse mode captures clicks, so terminal selection is blocked by default. Bypass it:

- **macOS** (Terminal.app, iTerm2, WezTerm, Ghostty): hold **⌥ Option** while click-dragging, then `⌘C`
- **Linux** (Kitty, Alacritty, WezTerm, GNOME Terminal): hold **Shift** while click-dragging, then `Ctrl-Shift-C`

## Themes

Press `t` to toggle. Two themes ship:

- **Dark** (default) — black background, orange accents, white text
- **Light** — true to HN.com: white background, orange topbar, `#f6f6ef` highlights, classic byline greys

## Development

```bash
git clone https://github.com/ahmd-sh/hackernuis.git
cd hackernuis
bun install
bun dev    # hot reload
```

Tree:

```
src/
├── index.tsx              # entry: renderer + <App />
├── App.tsx                # state machine + keyboard dispatch
├── theme.ts               # Theme context + dark/light palettes
├── spinner.ts             # vendored Knight Rider utils
├── api/                   # HN Firebase client + types
├── hooks/                 # useStoryIds, useItems, useCommentTree
├── components/            # Header, StatusBar, StoryRow, CommentNode, Loader, LinksPopup
├── views/                 # StoryListView, StoryDetailView
└── utils/                 # format, openUrl
```

Data source: [Hacker News Firebase API](https://github.com/HackerNews/API).

## Acknowledgments

- **[OpenTUI](https://github.com/anomalyco/opentui)** by Anomaly — the native TUI core powering this
- **[opentui-spinner](https://github.com/msmps/opentui-spinner)** by Matt Simpson — the Knight Rider scanner code is adapted from `examples/knight-rider/utils.ts` (MIT)
- **[Hacker News](https://news.ycombinator.com)** — for the content and the API

## License

[MIT](./LICENSE) © Ahmed Shaikh
