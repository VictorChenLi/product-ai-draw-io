# OST Draw.io – Logic & File Map

This document summarizes the project structure and key files for ost-draw-io. It is updated as phases complete.

**Source:** [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) (cloned and rebranded).  
**Plan:** [PLAN-ost-draw-io-architecture.md](./PLAN-ost-draw-io-architecture.md)

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

## Key directories

| Path | Purpose |
|-----|--------|
| `app/` | Next.js app router: `[lang]/` (locale), `api/` (chat, config, etc.) |
| `components/` | UI: chat panel, chat input, settings, dialogs |
| `lib/` | Storage, i18n, AI providers, session-storage, types |
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
