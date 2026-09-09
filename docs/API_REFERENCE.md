# AgentForge Backend API Reference

The AgentForge server is built on **Hono** and exposes type-safe REST and streaming RPC endpoints. The CLI communicates with the server using Hono's RPC client (`hc<AppType>`).

---

## 1. Global Server Settings

- **Default Port**: `3000` (configurable via `PORT` or `process.env.API_URL`)
- **Idle Timeout**: `255 seconds` (extended to support deep thinking loops and multi-step tool calls)
- **Response Format**: `application/json` (REST endpoints) or `text/event-stream` (chat streaming)

### Standard Error Response

```json
{
  "error": "Error description message"
}
```

---

## 2. Authentication & Middleware

Endpoints under `/sessions/*`, `/chat/*`, and `/billing/checkout` require authentication.

### Authorization Header
```http
Authorization: Bearer <clerk_oauth_token>
```

### Middleware Pipeline

1. **`requireAuth`**: Validates the Bearer token with `@clerk/backend`. Extracts the user ID and populates `c.set("userId", userId)`. Returns `401 Unauthorized` if invalid.
2. **`requireCreditsBalance`**: Checks the user's active credit meter in Polar. Returns `402 Payment Required` if balance $\le 0$, blocking execution before AI tokens are generated.

---

## 3. Endpoints Catalog

### Authentication

#### `GET /auth/callback`
Handles OAuth 2.0 PKCE redirects from Clerk.

- **Query Parameters**:
  - `code` *(string, required)*: Temporary authorization code from Clerk.
  - `state` *(string, required)*: Base64URL-encoded payload containing the local CLI listener port and security nonce.
  - `error` *(string, optional)*: Error code if authentication failed.
  - `error_description` *(string, optional)*: Detailed error text.
- **Behavior**: Decodes the local port from `state` and issues a `302 Redirect` to `http://localhost:<port>/callback?code=...&state=...`.
- **Responses**:
  - `302 Found`: Redirects browser back to the CLI callback server.
  - `400 Bad Request`: Missing code, invalid state format, or OAuth error.

---

### Chat & Streaming

#### `POST /chat`
Streams real-time LLM responses, thinking tokens, and tool call invocations via Server-Sent Events (SSE).

- **Security**: Requires `requireAuth` + `requireCreditsBalance`.
- **Content-Type**: `application/json` (Request) $\to$ `text/event-stream` (Response).
- **Request Body**:
  ```json
  {
    "id": "cuid_session_id",
    "mode": "BUILD",
    "model": "claude-opus-4-6",
    "messages": [
      {
        "id": "msg_123",
        "role": "user",
        "parts": [
          { "type": "text", "text": "Inspect the root package.json" }
        ]
      }
    ]
  }
  ```

- **Validation Rules**:
  - `id`: Non-empty session identifier string.
  - `mode`: Must be `"BUILD"` or `"PLAN"`.
  - `model`: Must match one of the supported model IDs.
  - `messages`: Array of `NightcodeUIMessage` objects (min length: 1).

- **Supported Models**:
  - `claude-opus-4-6` (Anthropic, extended thinking: 10k budget)
  - `claude-sonnet-4-6` (Anthropic, extended thinking: 10k budget)
  - `claude-haiku-4-5` (Anthropic)
  - `gpt-5.4` (OpenAI, reasoning summary: detailed)
  - `gpt-5.4-mini` (OpenAI)
  - `gpt-5.4-nano` (OpenAI)

- **SSE Stream Output**:
  Implements the Vercel AI SDK UIMessage Protocol:
  - `start`: Message initiation with mode and model metadata.
  - `reasoning`: Streamed thinking tokens (rendered as italicized thinking blocks).
  - `text-delta`: Streamed text response tokens.
  - `tool-call`: Server requests local tool execution (`readFile`, `writeFile`, etc.).
  - `finish`: Final usage statistics (tokens consumed, elapsed duration).

- **Post-Stream Actions**:
  - Automatically updates session messages in PostgreSQL.
  - Computes billable credits from total token usage.
  - Reports consumption to Polar via `ingestAiUsage`.

---

### Sessions

#### `GET /sessions`
Lists all sessions for the authenticated user, ordered from newest to oldest.

- **Security**: Requires `requireAuth`.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "cm1234567890",
      "title": "Refactor auth middleware",
      "createdAt": "2026-09-09T18:20:00.000Z"
    }
  ]
  ```

#### `GET /sessions/:id`
Retrieves full details of a specific session, including message history.

- **Security**: Requires `requireAuth`. Scoped to the caller's `userId`.
- **Response**: `200 OK`
  ```json
  {
    "id": "cm1234567890",
    "userId": "user_2a...",
    "title": "Refactor auth middleware",
    "createdAt": "2026-09-09T18:20:00.000Z",
    "updatedAt": "2026-09-09T18:25:00.000Z",
    "messages": [ /* UIMessage history */ ]
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Session does not exist or belongs to another user.

#### `POST /sessions`
Initializes a new session.

- **Security**: Requires `requireAuth` + `requireCreditsBalance`.
- **Request Body**:
  ```json
  {
    "title": "New feature exploration"
  }
  ```
- **Response**: `201 Created` with the newly created `Session` record.

---

### Billing & Credits

#### `POST /billing/checkout`
Creates a Polar checkout session to purchase usage credits.

- **Security**: Requires `requireAuth`.
- **Response**: `200 OK`
  ```json
  {
    "url": "https://sandbox.polar.sh/checkout/..."
  }
  ```

#### `POST /billing/portal`
Generates a URL to the Polar Customer Portal for viewing past orders, credit meters, and billing details.

- **Security**: Requires `requireAuth`.
- **Response**: `200 OK`
  ```json
  {
    "url": "https://sandbox.polar.sh/customer-portal/..."
  }
  ```

#### `GET /billing/success`
Informational landing page displayed after a successful Polar checkout.
- **Response**: `200 OK (text/plain)`: `"Done. You can close this tab and return to AgentForge."`
