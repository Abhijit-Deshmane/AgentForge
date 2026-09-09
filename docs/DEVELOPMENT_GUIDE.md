# AgentForge Developer & Contributor Guide

This guide walks through setting up your local environment, contributing to the AgentForge monorepo, extending tools and models, and debugging common issues.

---

## 1. Prerequisites

Ensure your development machine has the following dependencies installed:

- **[Bun](https://bun.sh/)** $\ge 1.2.0$ (Primary runtime, package manager, and bundler)
- **Node.js** $\ge 20.0.0$ (Required for auxiliary tooling compatibility)
- **PostgreSQL** $\ge 15.0$ (Local instance, Docker container, or [Neon](https://neon.tech/) cloud database)
- **Git**

---

## 2. Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Abhijit-Deshmane/AgentForge.git
cd AgentForge
```

### 2. Install Dependencies
```bash
bun install
```
Bun automatically links workspace packages (`@agentforge/cli`, `@agentforge/server`, `@agentforge/database`, `@agentforge/shared`).

### 3. Setup Environment Variables
```bash
cp .env.example .env
```
Open `.env` and fill in:
- `DATABASE_URL` — your PostgreSQL connection string.
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` — at least one valid LLM provider API key.
- `CLERK_*` credentials (or test credentials).
- `POLAR_*` credentials (for sandbox testing).

### 4. Generate Prisma Client
```bash
bun run --cwd packages/database db:generate
```

---

## 3. Development Scripts

The root `package.json` provides scripts to manage services:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `bun dev:server` | `bun run --hot packages/server/src/index.ts` | Starts the Hono backend server on port 3000 with hot module reloading. |
| `bun dev:cli` | `bun run --watch packages/cli/src/index.tsx` | Starts the OpenTUI terminal interface with file watchers. |
| `bun build:cli` | `bun run --filter @agentforge/cli build` | Compiles the CLI into an executable bundle under `packages/cli/dist`. |
| `bun link:cli` | `bun run build:cli && cd packages/cli && bun link` | Builds and globally links the `AgentForge` binary on your system. |

### Running the Full Development Stack
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
bun dev:server
```

**Terminal 2 (CLI TUI):**
```bash
bun dev:cli
```

---

## 4. How to Add a New Tool

Tools in AgentForge follow a unified contract defined in `@agentforge/shared` and implemented locally in `@agentforge/cli`.

### Step 1: Define the Tool Schema in `@agentforge/shared`
Open [`packages/shared/src/schemas.ts`](file:///packages/shared/src/schemas.ts):
```ts
// 1. Define Zod input schema
export const toolInputSchemas = {
  // ... existing tools
  createBranch: z.object({
    branchName: z.string().describe("Name of the git branch to create"),
  }),
};

// 2. Add to buildToolContracts (or readOnlyToolContracts if non-mutating)
export const buildToolContracts = {
  ...readOnlyToolContracts,
  // ... existing tools
  createBranch: tool({
    description: "Create a new git branch in the repository.",
    inputSchema: toolInputSchemas.createBranch,
  }),
};
```

### Step 2: Implement Execution in `@agentforge/cli`
Open [`packages/cli/src/lib/local-tools.ts`](file:///packages/cli/src/lib/local-tools.ts):
```ts
export async function executeLocalTool(toolName: string, input: unknown, mode: ModeType) {
  // ...
  switch (toolName) {
    // ... existing tools
    case "createBranch": {
      const { branchName } = toolInputSchemas.createBranch.parse(input);
      const proc = Bun.spawn(["git", "checkout", "-b", branchName], {
        cwd: resolveInsideCwd(".").resolved,
      });
      await proc.exited;
      return { success: true, branch: branchName };
    }
  }
}
```

---

## 5. How to Add a New AI Model

### Step 1: Add Model Specification to `@agentforge/shared`
Open [`packages/shared/src/models.ts`](file:///packages/shared/src/models.ts):
```ts
export const SUPPORTED_CHAT_MODELS = [
  // ...
  {
    id: "gpt-5-turbo",
    provider: "openai",
    pricing: {
      inputUsdPerMillionTokens: 2.0,
      outputUsdPerMillionTokens: 10.0,
    },
  },
] as const;
```

### Step 2: Wire Model Resolution in `@agentforge/server`
Open [`packages/server/src/lib/models.ts`](file:///packages/server/src/lib/models.ts):
- Add any provider-specific options (such as thinking token budgets or reasoning summary levels).
- The model will automatically appear in the CLI's `/models` dialog and adhere to credit calculations.

---

## 6. Database Migrations

AgentForge uses Prisma with the PostgreSQL driver adapter:

- **Generate Types**: `bun run --cwd packages/database db:generate`
- **Create a New Migration**:
  ```bash
  cd packages/database
  bunx prisma migrate dev --name <migration_name>
  ```
- **Inspect Database with Prisma Studio**:
  ```bash
  cd packages/database
  bunx prisma studio
  ```

---

## 7. Troubleshooting

### `DATABASE_URL is not set`
- Ensure `.env` exists in the workspace root.
- Verify `DATABASE_URL` starts with `postgresql://`.

### Port 3000 Already in Use (`EADDRINUSE`)
- Check if another instance of the server is running:
  ```bash
  # Windows PowerShell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
  ```

### OAuth State Mismatch During `/login`
- Ensure your browser redirected back to the port specified in the state parameter.
- Check that `CLERK_FRONTEND_API` and `CLERK_OAUTH_CLIENT_ID` match your Clerk Dashboard configuration.

### Tool Fails with "Path is outside the project directory"
- All tool file paths must resolve within the current working directory. Relative paths like `../../foo.txt` are prohibited by design.
