# OST Draw.io – Logic & File Map

This document summarizes the project structure and key files for ost-draw-io. It is updated as phases complete.

**Source:** [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) (cloned and rebranded).  
**Plans:** [PLAN-ost-draw-io-architecture.md](./PLAN-ost-draw-io-architecture.md) · [PLAN-prompt-templates.md](./context/PLAN-prompt-templates.md)

---

## Phase 1 (completed)

Identity and storage are scoped to **ost-draw-io** so the app does not share data with next-ai-draw-io.

| Area | Files | Notes |
|------|--------|------|
| **Package** | `package.json` | `name`: `ost-draw-io` |
| **Storage keys** | `lib/storage.ts` | All keys use prefix `ost-draw-io-*` |
| **Session DB** | `lib/session-storage.ts` | `DB_NAME`: `ost-drawio`, `MIGRATION_FLAG`: `ost-drawio-migrated-to-idb`; localStorage keys: `ost-draw-io-messages`, `ost-draw-io-xml-snapshots`, `ost-draw-io-diagram-xml` |
| **Locale / dark mode** | `app/[lang]/page.tsx`, `components/settings-dialog.tsx` | Keys: `ost-draw-io-locale`, `ost-draw-io-dark-mode` |
| **Model config** | `hooks/use-model-config.ts` | Uses `STORAGE_KEYS` only; `OLD_KEYS` repointed to same (no cross-app migration) |
| **Metadata / SEO** | `app/[lang]/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` | OST titles/descriptions; `metadataBase` and URLs use placeholder `https://ost-draw-io.example.com` (set to your deployment URL) |
| **MCP** | `packages/mcp-server/package.json`, `packages/mcp-server/src/index.ts` | Name: `ost-draw-io-mcp-server` / `ost-drawio` |
| **Electron** | `electron/main/app-menu.ts`, `scripts/electron-dev.mjs` | App name: `ost-draw-io`; Help menu URLs point to upstream repo |
| **Wrangler** | `wrangler.jsonc` | `name` and service: `ost-draw-io-worker` |
| **README / docs** | `README.md` | OST Draw.io title, one-liner, links to PRD and plan |

---

## Phase 2 (completed)

Main UI is rebranded for OST: header, i18n copy, and layout metadata.

| Area | Files | Notes |
|------|--------|------|
| **Chat panel header** | `components/chat-panel.tsx` | Header title and logo `alt` use i18n `nav.appTitle` ("OST Draw.io"); session/sessionStorage keys: `ost-draw-io-session-id`, `ost-draw-io-input` |
| **i18n** | `lib/i18n/dictionaries/en.json`, `ja.json`, `zh.json`, `zh-Hant.json` | `nav.appTitle`: "OST Draw.io"; `chat.placeholder`, `chat.uploadFile`, `examples.*` updated for OST (upload context doc + problem statement, OST quick examples) |
| **Layout metadata** | `app/[lang]/layout.tsx` | OST title and description per locale (already set in 1.7); no change needed for 2.3 |

---

## Phase 3 (completed)

OST-first generation: first message goes to `/api/ost/generate`; response is parsed and rendered on the canvas.

| Area | Files | Notes |
|------|--------|------|
| **OST lib** | `lib/ost/prompts.ts`, `lib/ost/extractFileText.ts`, `lib/ost/generateOST.ts` | OST system prompt; `buildOSTUserPrompt(context)`; `extractTextFromFile(file)` (PDF/text via pdf-utils); `generateOSTRaw({ context, ...clientOverrides })` calls AI with display_diagram tool, returns XML |
| **OST API** | `app/api/ost/generate/route.ts` | POST: JSON `{ context }` or multipart (file + context/problemStatement); builds context string; forwards AI headers; returns `{ raw }` or `{ error }` |
| **Chat panel** | `components/chat-panel.tsx` | When `messages.length === 0`: after cache check, POST `/api/ost/generate` with `{ context: userText }` and same headers as chat; on success: formatXML(raw), setMessages (user + assistant with display_diagram), onDisplayChart(xml), clear input/files |
| **Default route** | — | No change; default is already canvas + chat with OST copy (3.3 satisfied) |

---

## Prompt templates (PLAN-prompt-templates.md)

### Phase 0.1 (completed)

Template registry and types: single source of truth for prompt templates (OST, user-flow) and their i18n / system-prompt keys.

| Area | Files | Notes |
|------|--------|------|
| **Types** | `lib/prompt-templates/types.ts` | `PromptTemplateId`: "ost" or "user-flow"; `PromptTemplate`: id, labelKey, descriptionKey, placeholderKey, systemPromptKey |
| **Registry** | `lib/prompt-templates/index.ts` | `PROMPT_TEMPLATES` (ost, user-flow); `getPromptTemplateById(id)`, `getSystemPromptKeyForTemplate(id)`; i18n keys e.g. `promptTemplates.ost.placeholder`, `promptTemplates.userFlow.placeholder` |

### Phase 0.2 (completed)

User-flow system prompt for the "user flow for a solution" template.

| Area | Files | Notes |
|------|--------|------|
| **User-flow prompt** | `lib/user-flow/prompts.ts` | `USER_FLOW_SYSTEM_PROMPT`: draw.io user flow (steps, decisions, connectors); display_diagram once, mxCell-only, parent="1", ids from 2; 0–800×600; rounded steps (blue), diamond decisions (yellow) |

### Phase 1.1 (completed)

Chat API reads `promptTemplateId` from the request body and selects the system prompt for the first message when the diagram is empty.

| Area | Files | Notes |
|------|--------|------|
| **Chat route** | `app/api/chat/route.ts` | Parse `promptTemplateId` from body; `templateId = getSystemPromptKeyForTemplate(promptTemplateId) ?? null`; first message + empty diagram: use `USER_FLOW_SYSTEM_PROMPT` if `templateId === "user-flow"`, else `OST_SYSTEM_PROMPT`; otherwise `getSystemPrompt(modelId, minimalStyle)`. Second system message: "user flow" vs "Opportunity Solution Tree" by template. |

### Phase 2.1 (completed)

Prompt template i18n: label, description, placeholder for OST and user-flow.

| Area | Files | Notes |
|------|--------|------|
| **i18n** | `lib/i18n/dictionaries/en.json`, `ja.json`, `zh.json`, `zh-Hant.json` | Top-level `promptTemplates.ost` and `promptTemplates.userFlow`; each has `label`, `description`, `placeholder`. Keys match registry (`dict.promptTemplates.ost.placeholder`, `dict.promptTemplates.userFlow.placeholder`). |

### Phase 3.1–3.2 (completed)

Client state for selected prompt template and sending `promptTemplateId` in the chat request body.

| Area | Files | Notes |
|------|--------|------|
| **Chat panel state** | `components/chat-panel.tsx` | `selectedPromptTemplateId` state (default `"ost"`); `PromptTemplateId` from `@/lib/prompt-templates`; passed to `ChatMessageDisplay` as `selectedPromptTemplateId` and `onSelectPromptTemplate={setSelectedPromptTemplateId}`. |
| **Request body** | `components/chat-panel.tsx` | In `sendChatMessage`, `body` includes `...(selectedPromptTemplateId && { promptTemplateId: selectedPromptTemplateId })` so `/api/chat` receives it. |
| **Props to lobby** | `components/chat-message-display.tsx`, `components/chat/ChatLobby.tsx`, `components/chat-example-panel.tsx` | `ChatMessageDisplay` → `ChatLobby` → `ExamplePanel` receive optional `selectedPromptTemplateId` and `onSelectPromptTemplate` (Phase 4 will wire template cards to call them). |

### Phase 4.1–4.2 (completed)

Template-specific placeholder and lobby with two template cards.

| Area | Files | Notes |
|------|--------|------|
| **Placeholder** | `components/chat-panel.tsx`, `components/chat-input.tsx` | `inputPlaceholder` from `selectedPromptTemplateId` + dict (`promptTemplates.ost.placeholder`, `promptTemplates.userFlow.placeholder`, else `chat.placeholder`); `ChatInput` accepts optional `placeholder` prop. |
| **Lobby** | `components/chat-example-panel.tsx` | Two template cards only: OST (FileText) and User flow (GitBranch); label/description from `dict.promptTemplates.ost` / `dict.promptTemplates.userFlow`; click calls `onSelectPromptTemplate(id)`, clears input/files; active state via `isSelected` (ring/border). MCP notice and welcome section kept; old example cards removed. |

### Phase 5.1 (completed)

Persist last-used prompt template so refresh and new chat keep the same selection.

| Area | Files | Notes |
|------|--------|------|
| **Storage key** | `lib/storage.ts` | `STORAGE_KEYS.promptTemplateId`: `"ost-draw-io-prompt-template-id"` (used in sessionStorage). |
| **Chat panel** | `components/chat-panel.tsx` | Initial state reads from `sessionStorage.getItem(STORAGE_KEYS.promptTemplateId)`; valid values `"ost"` or `"user-flow"`, else default `"ost"`. `useEffect` writes `selectedPromptTemplateId` to sessionStorage when it changes. New chat does not clear template (keeps last one). |

---

## Key directories

| Path | Purpose |
|-----|--------|
| `app/` | Next.js app router: `[lang]/` (locale), `api/` (chat, config, etc.) |
| `components/` | UI: chat panel, chat input, settings, dialogs |
| `lib/` | Storage, i18n, AI providers, session-storage, types, ost, user-flow, prompt-templates |
| `hooks/` | use-model-config, use-dictionary, etc. |
| `electron/` | Electron main process, menu, windows |
| `packages/mcp-server/` | MCP server for diagram generation |
| `docs/` | Documentation (en, ja, cn, shape-libraries) |

---

## Document history

| Date | Change |
|------|--------|
| 2026-02-02 | Created; Phase 1 file map and completion summary. |
| 2026-02-01 | Phase 2: chat-panel header/i18n, OST dictionaries (en/ja/zh/zh-Hant), layout metadata verified. |
| 2026-02-01 | Phase 3: lib/ost (prompts, extractFileText, generateOST), POST /api/ost/generate, chat submit → OST when messages.length === 0; 3.3 no change. |
| 2026-02-03 | Prompt templates Phase 0.1: lib/prompt-templates (types.ts, index.ts) – registry and getters for ost and user-flow templates. |
| 2026-02-03 | Prompt templates Phase 0.2: lib/user-flow/prompts.ts – USER_FLOW_SYSTEM_PROMPT for user flow diagram (Phase 0 complete). |
| 2026-02-03 | Prompt templates Phase 1.1: chat route parses promptTemplateId, selects OST vs user-flow system prompt and second system message (Phase 1 complete). |
| 2026-02-03 | Prompt templates Phase 2.1: promptTemplates.ost and promptTemplates.userFlow (label, description, placeholder) in en/ja/zh/zh-Hant (Phase 2 complete). |
| 2026-02-03 | Prompt templates Phase 3: selectedPromptTemplateId state, promptTemplateId in chat body, props passed ChatMessageDisplay → ChatLobby → ExamplePanel (Phase 3 complete). |
| 2026-02-03 | Prompt templates Phase 4: template placeholder in ChatInput; lobby shows two template cards (OST, user-flow), active state, old examples removed (Phase 4 complete). |
| 2026-02-03 | Prompt templates Phase 5.1: persist last-used template in sessionStorage (key in lib/storage.ts); init state from storage, persist on change; new chat keeps last template (Phase 5.1 complete). |
