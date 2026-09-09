# AgentForge CLI Reference Manual

This guide provides a comprehensive manual for the **AgentForge Terminal User Interface (TUI)**, including keyboard shortcuts, navigation patterns, interactive dialogs, slash commands, file mentions, and customization options.

---

## 1. Overview & Invocation

The AgentForge CLI is an interactive terminal application built on **OpenTUI** (`@opentui/core` and `@opentui/react`), targeting a silky smooth 60 frames-per-second experience directly inside your shell.

### Launching the CLI

```bash
# Direct binary execution (when globally linked)
AgentForge

# Local monorepo development mode (hot-reloading enabled)
bun dev:cli
```

### Global Binary Linking
To use `AgentForge` from any terminal directory:
```bash
bun run link:cli
```
This builds `@agentforge/cli` into `packages/cli/dist` and executes `bun link`, making the `AgentForge` executable available in your system path.

---

## 2. Terminal UI Layout

The AgentForge interface is organized into clear functional zones:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ AgentForge                                         [● Signed In / Guest]   │  <- Header
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  > Plan the database migration to PostgreSQL                              │  <- User Message
│                                                                            │
│  │ Thinking: Analyzing schema.prisma and packages/database...              │  <- Thinking Stream
│  │ Read File: packages/database/prisma/schema.prisma                       │  <- Tool Execution
│                                                                            │
│  Here is the recommended migration plan:                                   │  <- Bot Response
│  1. Create the new schema with Prisma Pg adapter...                        │
│                                                                            │
│  ◉ Plan › claude-opus-4-6 › 1.8s                                           │  <- Message Metadata
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│ ┃ Ask AgentForge... (Tab to switch mode, @ to mention, / for commands)     │  <- Input Bar
│ ┃ Plan › claude-opus-4-6                                                   │  <- Status Bar
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Keyboard Shortcuts & Controls

The CLI features a responsive keyboard responder stack designed for seamless developer ergonomics:

| Key Binding | Context | Action |
| :--- | :--- | :--- |
| <kbd>Enter</kbd> | Input Bar | Submit current prompt or execute highlighted command/mention. |
| <kbd>Shift</kbd> + <kbd>Enter</kbd> | Input Bar | Insert a newline into the prompt textarea. |
| <kbd>Tab</kbd> | Base Layer | Toggle instantaneously between **BUILD** mode and **PLAN** mode. |
| <kbd>Esc</kbd> | Streaming | **Interrupt** active generation / stop streaming response immediately. |
| <kbd>Esc</kbd> | Mention / Command | Close active `@` mention popup or `/` command suggestions menu. |
| <kbd>Esc</kbd> | Dialog | Dismiss modal dialog (e.g. Model Selector, Theme Selector). |
| <kbd>Ctrl</kbd> + <kbd>C</kbd> | Non-empty Input | Clear the current input text. |
| <kbd>Ctrl</kbd> + <kbd>C</kbd> | Empty Input | Exit or prompt dismissal. |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Mentions / Menus | Navigate candidates in autocomplete menus. |

---

## 4. Operational Modes: BUILD vs. PLAN

You can toggle between modes at any time using the <kbd>Tab</kbd> key or via the `/agents` command:

```
┌──────────────────────────────┬──────────────────────────────┐
│          BUILD MODE          │          PLAN MODE           │
├──────────────────────────────┼──────────────────────────────┤
│ Default indicator: Primary   │ Default indicator: Magenta   │
│ Capabilities:                │ Capabilities:                │
│ • Full read & write tools    │ • Read-only analysis tools   │
│ • Edits and writes files     │ • Proposes plans & diffs     │
│ • Executes shell commands    │ • Cannot alter disk state    │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 5. Slash Commands (`/`)

Type `/` in the input bar to open the interactive command palette:

```
┌────────────────────────────────────────────────────────────┐
│ /new        Start a new conversation session               │
│ /agents     Switch agent mode (Build vs Plan)              │
│ /models     Select AI model for generation                 │
│ /sessions   Browse and resume past sessions                │
│ /theme      Change terminal color palette                  │
│ /login      Sign in via browser using PKCE OAuth           │
│ /logout     Sign out and clear local credentials           │
│ /upgrade    Purchase additional usage credits              │
│ /usage      Open Polar customer billing portal             │
│ /exit       Quit AgentForge                                │
└────────────────────────────────────────────────────────────┘
```

### Detailed Command Actions

- **`/new`**: Navigates to the session creation screen and initializes a fresh conversation context.
- **`/agents`**: Opens the Agent Mode selector dialog with fuzzy search.
- **`/models`**: Opens the Model Selector dialog. Allows choosing between Claude (Opus/Sonnet/Haiku) and OpenAI (GPT-5.4/Mini/Nano).
- **`/sessions`**: Fetches past sessions associated with your authenticated account from PostgreSQL. Selecting a session restores complete conversation history.
- **`/theme`**: Displays the interactive theme picker with live previews.
- **`/login`**: Spins up a local callback server, opens your default browser to Clerk OAuth, and automatically captures your session token.
- **`/logout`**: Deletes the local `~/.agentforge/auth.json` file and resets session state.
- **`/upgrade`**: Calls the backend billing endpoint and opens a Polar.sh checkout page to buy credits.
- **`/usage`**: Launches the Polar customer portal to review past invoices, active subscriptions, and meter consumption.
- **`/exit`**: Gracefully terminates the OpenTUI renderer and returns to your shell prompt.

---

## 6. File & Directory `@` Mentions

AgentForge includes a fast, native file mention engine. When you type `@` in the input bar, an interactive file-picker opens above the prompt:

- **Incremental Search**: Type letters after `@` (e.g. `@src/` or `@test`) to filter files and directories.
- **Directory Traversal**: Selecting a directory appends a trailing `/` so you can continue drilling down without leaving the keyboard.
- **Automatic Exclusion**: Automatically ignores `node_modules` and hidden dot-directories to keep search speeds instantaneous.
- **Safe Path Resolution**: Automatically normalizes paths relative to the current project working directory.

---

## 7. Color Themes & Aesthetics

AgentForge comes preloaded with curated developer themes matching popular editor color schemes:

| Theme Name | Style Summary | Primary Accent |
| :--- | :--- | :--- |
| **Nightfox** (Default) | Sleek dark teal palette with soft violet thinking accents. | `#56D6C2` |
| **Catppuccin Mocha** | Warm pastel aesthetics with soothing lavender highlights. | `#E0AF68` |
| **Dracula** | Iconic high-contrast dark theme with vibrant purples and greens. | `#BD93F9` |
| **Monokai Pro** | High-energy gold, magenta, and charcoal tones. | `#FFD866` |
| **Tokyo Night** | Cool midnight blues inspired by the lights of Tokyo. | `#7AA2F7` |
| **Nord** | Arctic, north-bluish palette emphasizing clean minimalism. | `#EBCB8B` |

Themes can be switched in real time without restarting the application via `/theme`.

---

## 8. Local Tool Execution Details

When an AI model decides to invoke a tool, the action is routed to `executeLocalTool()` in `@agentforge/cli/src/lib/local-tools.ts`:

### 1. `readFile`
- Reads file text relative to the current directory.
- Protected by a 10,000-character ceiling to prevent model context window saturation.

### 2. `listDirectory`
- Lists entries in the specified directory.
- Automatically ignores hidden files (`.*`) and `node_modules`.

### 3. `glob`
- Scans files matching a glob pattern using `Bun.Glob`.
- Fast, non-blocking asynchronous generator capped at 200 matches.

### 4. `grep`
- Performs regex searches across project files using native grep.
- Excludes `.git` and `node_modules` by default. Capped at 50 matching lines.

### 5. `writeFile` *(BUILD Mode only)*
- Creates or overwrites files.
- Automatically creates non-existent parent directories (`mkdir -p`).

### 6. `editFile` *(BUILD Mode only)*
- Performs deterministic string replacement.
- Guarantees precision: if `oldString` does not match or matches multiple locations, the tool fails safely rather than making ambiguous edits.

### 7. `bash` *(BUILD Mode only)*
- Executes arbitrary shell commands.
- Runs with `TERM=dumb` and a 30-second execution timeout.
- Truncates standard output and error to 20,000 characters.
