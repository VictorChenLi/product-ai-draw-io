# OST Draw.io – Detailed Implementation Plan (Reuse Main UI + Rebrand)

**Version:** 1.2  
**Date:** 2026-02-01  
**Status:** Plan for implementation  

---

## Instructions for developers

- **Check off items** as you complete them: change `[ ]` to `[x]` (e.g. `[x] [1.1](#11-ensure-project-source-in-this-folder)`).
- **Use the checklist links** to jump to each task section for tech design and code snippets.
- **Commit frequently** with descriptive messages; test each feature before moving on.
- **Update this checklist** when you finish a task so progress is visible to the team.
- **Paths** in this plan are relative to this project folder (ost-draw-io).
- **Optional items** (marked *(Optional)*) can be deferred or skipped; core flow is Phases 1–2 and 3.1–3.2.

---

## Implementation checklist

### Phase 1: Setup and rename to ost-draw-io
- [x] [1.1](#11-ensure-project-source-in-this-folder) Ensure project source in this folder (clone from https://github.com/DayuanJiang/next-ai-draw-io if needed)
- [x] [1.2](#12-update-package-name) Update package.json name to ost-draw-io
- [x] [1.3](#13-update-storage-keys) Update lib/storage.ts keys to ost-draw-io prefix
- [x] [1.4](#14-update-session-storage-db-name) Update lib/session-storage.ts DB name and migration keys
- [x] [1.5](#15-update-locale-and-dark-mode-keys) Update locale and dark-mode localStorage keys
- [x] [1.6](#16-update-use-model-config-keys) Update hooks/use-model-config.ts (use STORAGE_KEYS only; no next-ai-draw-io keys)
- [x] [1.7](#17-update-metadata-sitemap-robots) Update metadata, sitemap, and robots for ost-draw-io
- [x] [1.8](#18-update-mcp-electron-wrangler-names) Update MCP, Electron, and wrangler names
- [x] [1.9](#19-update-readme-and-docs) README and docs: minimal ost-draw-io identity and links (full pass in 4.1)
- [x] [1.10](#110-verify-app-runs-and-identity) Verify app runs and no next-ai-draw-io identity remains

### Phase 2: Rebrand main UI for OST
- [x] [2.1](#21-replace-header-title-and-logo-alt) Replace header title and logo alt in chat-panel.tsx (use i18n nav.appTitle)
- [x] [2.2](#22-update-i18n-dictionaries) Update i18n dictionaries (en, ja, zh, zh-Hant) for OST copy
- [x] [2.3](#23-update-layout-metadata) Update app/[lang]/layout.tsx OST title and description (metadataBase in 1.7)

### Phase 3: OST-first generation with upload
- [x] [3.1](#31-extend-api-ost-generate-for-file--context) Extend POST /api/ost/generate for file + context; build combined prompt
- [x] [3.2](#32-wire-main-chat-to-ost-generation) Wire main chat submit to OST API, parse response, render OST
- [x] [3.3](#33-optional-make-default-route-ost-experience) *(Optional)* Make default route (/) the OST experience

### Phase 4: Polish and docs
- [ ] [4.1](#41-readme-and-docs) Finalize README and docs (run, env, PRD/plan links)
- [ ] [4.2](#42-optional-ost-quick-examples-in-ui) *(Optional)* OST quick examples and one-click templates in UI

---

## 1. Executive summary

This plan defines how to build **ost-draw-io** in **this project folder** by **reusing the main UI** of next-ai-draw-io (as source) and **rebranding** it to focus on **Opportunity Solution Tree (OST)**. Users can generate OST **without being highly specific** by **uploading a context document and problem statement** to start diagram generation.

**Key decisions:** Code lives in **this project folder** (ost-draw-io); UI = reuse canvas + chat panel, rebrand for OST; Entry = upload context doc + problem statement → generate OST; Identity = package, storage keys, metadata use **ost-draw-io**.

---

## 2. Goals and architecture

- **Reuse main UI** – Canvas (left) + AI chat panel (right), toolbars, zoom, file upload.
- **Rebrand for OST** – Replace “Next AI Drawio” with OST-focused branding.
- **OST-first generation** – Upload context doc + problem statement → generate OST (no long prompt required).
- **Clear code boundary** – Project in **this folder** (ost-draw-io).

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ost-draw-io (this project folder)                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Reused main UI                                                          │
│  ┌──────────────────────────────┬────────────────────────────────────┐  │
│  │  Canvas (left)                │  Chat panel (right)                 │  │
│  │  - draw.io embed / OST view   │  - Header: "OST Draw.io"            │  │
│  │  - Toolbar, zoom              │  - Input: "Upload context doc &     │  │
│  │                               │    problem statement to generate   │  │
│  │                               │    OST…" + File upload + Send       │  │
│  └──────────────────────────────┴────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  OST flow: Upload + problem statement → /api/ost/generate → parse &      │
│  validate OST JSON → render (tree view or draw.io XML)                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Setup and rename to ost-draw-io

### 1.1 Ensure project source in this folder

**Task:** Ensure this project folder contains the app. If the folder already has the codebase, skip to step 1. If empty, clone the **next-ai-draw-io** repository here first.

**Source:** [https://github.com/DayuanJiang/next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)

**Steps:**
1. **If folder is empty:** clone next-ai-draw-io into this folder:
   ```bash
   git clone https://github.com/DayuanJiang/next-ai-draw-io.git .
   ```
2. In this project folder:
   ```bash
   npm install
   ```
3. Copy `env.example` to `.env.local` and set AI provider/model as needed.
4. Run `npm run dev` and confirm the app runs (e.g. port 6002).

**Validation:**
- [ ] This folder contains the full project tree
- [ ] `npm install` and `npm run dev` succeed
- [ ] All subsequent tasks are done in this project folder

---

### 1.2 Update package name

**Task:** Set the npm package name to **ost-draw-io** so the project is clearly differentiated.

**File(s):** `package.json`

**Implementation:**

```json
{
    "name": "ost-draw-io",
    "version": "0.4.12",
    ...
}
```

Change only the `"name"` field from `"next-ai-draw-io"` to `"ost-draw-io"`. Leave version and other fields as-is unless you have a separate versioning policy.

**Validation:**
- [ ] `package.json` has `"name": "ost-draw-io"`
- [ ] No lint/JSON errors

---

### 1.3 Update storage keys

**Task:** Replace all localStorage key prefixes from `next-ai-draw-io-*` to `ost-draw-io-*` so ost-draw-io does not share storage with next-ai-draw-io.

**File(s):** `lib/storage.ts`

**Implementation:** Replace every occurrence of `"next-ai-draw-io-` with `"ost-draw-io-` in the `STORAGE_KEYS` object.

```typescript
// lib/storage.ts – after change
export const STORAGE_KEYS = {
    requestCount: "ost-draw-io-request-count",
    requestDate: "ost-draw-io-request-date",
    tokenCount: "ost-draw-io-token-count",
    tokenDate: "ost-draw-io-token-date",
    tpmCount: "ost-draw-io-tpm-count",
    tpmMinute: "ost-draw-io-tpm-minute",
    accessCode: "ost-draw-io-access-code",
    accessCodeRequired: "ost-draw-io-access-code-required",
    aiProvider: "ost-draw-io-ai-provider",
    aiBaseUrl: "ost-draw-io-ai-base-url",
    aiApiKey: "ost-draw-io-ai-api-key",
    aiModel: "ost-draw-io-ai-model",
    modelConfigs: "ost-draw-io-model-configs",
    selectedModelId: "ost-draw-io-selected-model-id",
    sendShortcut: "ost-draw-io-send-shortcut",
    vlmValidationEnabled: "ost-draw-io-vlm-validation-enabled",
} as const
```

**Validation:**
- [ ] No key contains `next-ai-draw-io`
- [ ] App still reads/writes settings (no runtime errors from missing keys)

---

### 1.4 Update session-storage DB name and migration keys

**Task:** Use a separate IndexedDB database and migration keys for ost-draw-io so chat/session data does not mix with next-ai-draw-io.

**File(s):** `lib/session-storage.ts`

**Implementation:** In this file, apply the following find-and-replace (all occurrences):

| Find | Replace |
|------|---------|
| `"next-ai-drawio"` (DB_NAME) | `"ost-drawio"` |
| `"next-ai-drawio-migrated-to-idb"` (MIGRATION_FLAG) | `"ost-drawio-migrated-to-idb"` |
| `"next-ai-draw-io-messages"` | `"ost-draw-io-messages"` |
| `"next-ai-draw-io-xml-snapshots"` | `"ost-draw-io-xml-snapshots"` |
| `"next-ai-draw-io-diagram-xml"` | `"ost-draw-io-diagram-xml"` |

Ensure every localStorage key used for migration or storage uses the ost-draw-io prefix so new sessions and chat data are isolated.

**Validation:**
- [ ] DB_NAME and MIGRATION_FLAG use `ost-drawio`
- [ ] All localStorage keys in this file use `ost-draw-io-*` (or ost-drawio for DB/migration flag)
- [ ] New sessions and chat data are stored under ost-draw-io identity

---

### 1.5 Update locale and dark-mode localStorage keys

**Task:** Use ost-draw-io-prefixed keys for locale and dark mode so preferences are separate from next-ai-draw-io.

**File(s):** `app/[lang]/page.tsx`, `components/settings-dialog.tsx`

**Implementation:**

In `app/[lang]/page.tsx`:
- Replace `"next-ai-draw-io-locale"` with `"ost-draw-io-locale"` (get and set).
- Replace `"next-ai-draw-io-dark-mode"` with `"ost-draw-io-dark-mode"` (get and set).

In `components/settings-dialog.tsx`:
- Replace `"next-ai-draw-io-locale"` with `"ost-draw-io-locale"` where locale is saved.

**Snippet (page.tsx):**

```typescript
// Example: restore saved locale
const savedLocale = localStorage.getItem("ost-draw-io-locale")

// Example: save dark mode
localStorage.setItem("ost-draw-io-dark-mode", String(newValue))
```

**Validation:**
- [ ] No reference to `next-ai-draw-io-locale` or `next-ai-draw-io-dark-mode` in these files
- [ ] Language and theme preferences persist correctly for ost-draw-io

---

### 1.6 Update use-model-config keys

**Task:** Use only ost-draw-io keys for model config. No migration from next-ai-draw-io is required.

**File(s):** `hooks/use-model-config.ts`

**Implementation:**
- The hook should use `STORAGE_KEYS` from `@/lib/storage` for all reads/writes (already ost-draw-io-* after 1.3).
- Remove or repoint `OLD_KEYS`: either delete migration logic for next-ai-draw-io, or set `OLD_KEYS` to the same values as `STORAGE_KEYS` so there is no cross-app migration.
- Search the file for any hardcoded `"next-ai-draw-io-ai-provider"`, `"next-ai-draw-io-ai-base-url"`, etc., and replace with `STORAGE_KEYS.aiProvider`, `STORAGE_KEYS.aiBaseUrl`, and so on.

**Validation:**
- [ ] No hardcoded next-ai-draw-io keys in use-model-config.ts
- [ ] Model/config selection and persistence work in ost-draw-io

---

### 1.7 Update metadata, sitemap, and robots

**Task:** Set app metadata and public URLs to ost-draw-io. Use a single base URL placeholder (e.g. your deployment domain) for consistency.

**File(s):** `app/[lang]/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`

**Implementation:** Choose your ost-draw-io base URL (e.g. `https://ost-draw-io.example.com`). Then:

| File | Change |
|------|--------|
| **app/[lang]/layout.tsx** | Set `metadataBase: new URL("YOUR_BASE_URL")`. Set `title` and `description` to OST-focused (e.g. “OST Draw.io – Opportunity Solution Tree diagramming”). *OST-specific copy can be refined in 2.3.* |
| **app/sitemap.ts** | Replace `https://next-ai-drawio.jiang.jp` with `YOUR_BASE_URL` in all `url` fields. |
| **app/robots.ts** | Replace `https://next-ai-drawio.jiang.jp` with `YOUR_BASE_URL` in the sitemap URL. |

**Validation:**
- [ ] metadataBase and titles reflect ost-draw-io
- [ ] Sitemap and robots use the same ost-draw-io base URL

---

### 1.8 Update MCP, Electron, and wrangler names

**Task:** Use ost-draw-io identity in MCP server, Electron app, and Cloudflare Worker config.

**File(s):** See table below.

**Implementation:** Apply the following per file:

| File | Change |
|------|--------|
| **packages/mcp-server/package.json** | Set `"name": "ost-draw-io-mcp-server"` (or `@ost-draw-io/mcp-server`). Update `bin` name if present. |
| **packages/mcp-server/src/index.ts** | Set server `name` to `"ost-drawio"` or `"ost-draw-io"` (replace `"next-ai-drawio"`). |
| **electron/main/app-menu.ts** | Replace GitHub/repo URLs and app name strings with ost-draw-io. |
| **scripts/electron-dev.mjs** | Replace app name `"next-ai-draw-io"` with `"ost-draw-io"` where used. |
| **wrangler.jsonc** | Set `name` (and any service bindings) to `"ost-draw-io-worker"`. |

**Validation:**
- [ ] MCP and Electron show ost-draw-io name where relevant
- [ ] Wrangler config uses ost-draw-io worker name

---

### 1.9 Update README and docs (minimal)

**Task:** Give the project an ost-draw-io identity in README and docs; minimal pass here—full pass in [4.1](#41-readme-and-docs).

**File(s):** `README.md`, and any docs under `docs/` that reference “Next AI Draw.io” or the repo name.

**Implementation:**
- **README:** Replace main title and description with “OST Draw.io” and an OST-focused one-liner. Add links to [PRD-ost-whiteboard-on-next-ai-draw-io.md](./PRD-ost-whiteboard-on-next-ai-draw-io.md) and [PLAN-ost-draw-io-architecture.md](./PLAN-ost-draw-io-architecture.md). (Run/env details can be completed in 4.1.)
- **docs:** Replace “next-ai-draw-io” / “Next AI Draw.io” with “ost-draw-io” / “OST Draw.io” where it refers to this product.

**Validation:**
- [ ] README identifies ost-draw-io and links to PRD and this plan
- [ ] No misleading “Next AI Draw.io” references in docs

---

### 1.10 Verify app runs and identity

**Task:** Run the app and confirm no user-facing or storage identity from next-ai-draw-io remains.

**Steps:**
1. In this project folder: `npm run dev`.
2. Open the app in the browser; check header, title, and any visible “Next AI Drawio” text.
3. Open DevTools → Application → Local Storage / IndexedDB; confirm keys and DB names use ost-draw-io (or ost-drawio).
4. Change language and theme; confirm they persist under ost-draw-io keys.

**Validation:**
- [ ] App runs without errors
- [ ] No “Next AI Drawio” in UI
- [ ] Storage uses ost-draw-io/ost-drawio identity

---

## Phase 2: Rebrand main UI for OST

### 2.1 Replace header title and logo alt

**Task:** Show “OST Draw.io” in the chat panel header and logo alt text. Prefer i18n so the title is consistent with 2.2.

**File(s):** `components/chat-panel.tsx`

**Implementation:**
- Search for the header block that renders the logo and title (e.g. “Next AI Drawio”).
- Replace with “OST Draw.io” for both `alt` and visible title. Prefer using the i18n key `nav.appTitle` (add it in 2.2) so the header and dictionaries stay in sync.

```tsx
// After (use t("nav.appTitle") if i18n is wired)
alt="OST Draw.io"
...
OST Draw.io
```

**Validation:**
- [ ] Header shows “OST Draw.io”
- [ ] Logo alt text is “OST Draw.io”

---

### 2.2 Update i18n dictionaries for OST copy

**Task:** Set chat placeholder, upload tooltip, examples title/subtitle, and quick examples to OST-focused copy.

**File(s):** `lib/i18n/dictionaries/en.json`, `lib/i18n/dictionaries/ja.json`, `lib/i18n/dictionaries/zh.json`, `lib/i18n/dictionaries/zh-Hant.json`

**Implementation (en.json):** Update at least the following keys. Other locales (ja, zh, zh-Hant) should mirror the same meaning.

```json
{
    "nav": {
        "appTitle": "OST Draw.io"
    },
    "chat": {
        "placeholder": "Upload context doc and problem statement to generate OST…",
        "uploadFile": "Upload context doc (PDF, text) or problem statement"
    },
    "examples": {
        "title": "Create OST with AI",
        "subtitle": "Upload a problem statement or context doc to generate an Opportunity Solution Tree",
        "quickExamples": "Quick Examples",
        "paperToDiagram": "Generate OST from product brief",
        "paperDescription": "Upload a product brief or doc to generate an OST",
        "animatedDiagram": "OST from user research",
        "animatedDescription": "Upload user research summary to generate OST",
        "awsArchitecture": "Generate Netflix-style OST",
        "awsDescription": "Generate an OST in the style of outcome-focused product trees"
    }
}
```

Use `nav.appTitle` in the chat panel header (2.1) for a single source of truth.

**Validation:**
- [ ] Placeholder and upload tooltip are OST-focused
- [ ] Examples title/subtitle and at least 2–3 quick examples are OST-oriented
- [ ] All four locale files updated consistently

---

### 2.3 Update layout metadata (OST title and description)

**Task:** Set page title and description in layout to OST-focused copy. `metadataBase` is already set in 1.7; here focus on `title` and `description` only.

**File(s):** `app/[lang]/layout.tsx`

**Implementation:** Update the exported `metadata` (or `generateMetadata`) so that `title` and `description` reference “OST Draw.io” and Opportunity Solution Tree, e.g. “OST Draw.io – Generate Opportunity Solution Trees from context and problem statements”. Do not change `metadataBase` (done in 1.7).

**Validation:**
- [ ] Browser tab title and meta description reflect OST Draw.io

---

## Phase 3: OST-first generation with upload

### 3.1 Extend POST /api/ost/generate for file + context; build combined prompt

**Task:** Allow the OST generation API to accept an optional file (context document) plus text (problem statement). Build a single context string and pass it to the existing `generateOSTRaw` flow.

**File(s):** `app/api/ost/generate/route.ts`, optionally `lib/ost/generateOST.ts` or a small helper for file text extraction.

**Tech design:**
- **Current:** `POST` with JSON body `{ context: string }`.
- **Extended:** Support (A) JSON body `{ context: string }` as today, or (B) `multipart/form-data` with optional file(s) and optional field `context` or `problemStatement`.
- **Prompt building:** Combine file text and problem statement into one string: `[extracted file text]\n\n[problem statement]`. Pass that to `buildOSTUserPrompt(problemAndContext)` (no change needed in `lib/ost/prompts.ts`). If only file or only text is provided, use that alone. For PDFs, use server-side extraction (e.g. existing util or a library such as pdf-parse); for plain text, read file content.
- Keep existing headers (x-ai-provider, x-ai-api-key, etc.) for model config. Return `{ raw }` on success, `{ error }` on failure.

**Implementation sketch:**

```typescript
// In route.ts: detect Content-Type
const contentType = req.headers.get("content-type") ?? ""
let context = ""

if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const problemStatement = formData.get("context") ?? formData.get("problemStatement") ?? ""
    if (file) {
        const fileText = await extractTextFromFile(file) // PDF/text extraction; implement or reuse
        context = [fileText, problemStatement].filter(Boolean).join("\n\n")
    } else {
        context = String(problemStatement)
    }
} else {
    const body = await req.json()
    context = typeof body?.context === "string" ? body.context : ""
}
// Then: buildOSTUserPrompt(context) and generateOSTRaw({ context, ... }) as today
```

**Validation:**
- [ ] JSON body with `context` still works
- [ ] multipart with file + optional context produces OST from combined text
- [ ] Combined context appears in the model request; errors and headers behave as before

---

### 3.2 Wire main chat to OST generation

**Task:** When the user clicks “Send” with a file and/or problem statement, call the OST API, then parse the response and render the OST (tree view or draw.io XML).

**File(s):** `components/chat-panel.tsx`, `components/chat-input.tsx`, and any submit/API call logic.

**Tech design:** Prefer calling `POST /api/ost/generate` with multipart (file + context) from the main chat submit, then parsing and rendering OST (Option B below). Option A would use the generic chat API with an OST system prompt and parse the stream as OST—possible but less clear.

**Implementation steps:**
1. **On submit:** Build `FormData` with optional file(s) and field `context` or `problemStatement` (matching 3.1).
2. **Request:** `POST /api/ost/generate` with multipart body; forward model config headers as needed.
3. **On success:** Run `parseAndValidateOST(raw)` on the response; update OST state.
4. **Render:** Update tree view or draw.io XML visualization with the parsed OST.
5. **On error:** Show validation or retry message in the UI.

Ensure the chat panel treats the main flow as OST-by-default (or an explicit OST mode) so Send always goes to the OST API when the user is on the OST experience.

**Validation:**
- [ ] User can upload a file and/or type a problem statement and click Send
- [ ] OST is generated and rendered (tree or canvas)
- [ ] Errors (validation/retry) are shown in UI

---

### 3.3 (Optional) Make default route OST experience

**Task:** If desired, make the default route (e.g. `/` or `/en`) show the OST-focused flow by default (same main UI, but primary CTA and examples are OST).

**File(s):** `app/[lang]/page.tsx` (main page). Optionally redirect `/` to `/en` or an OST-focused layout; or keep a single page and ensure the main page content and examples are OST (already done in Phase 2 if the main page is the canvas + chat with OST copy).

**Implementation:** No structural change if the main page is already the canvas + chat with OST rebranding. If you currently have a separate “home” with diagram examples, consider making the default view the same as the OST view (canvas + chat with “Upload context doc and problem statement to generate OST…”).

**Validation:**
- [ ] Landing on `/` (or default locale) shows OST-focused UI and flow

---

## Phase 4: Polish and docs

### 4.1 README and docs (final pass)

**Task:** Finalize README and docs with run instructions, env, and links. Complements the minimal identity pass in 1.9.

**File(s):** `README.md`, `docs/` as needed.

**Implementation:**
- **README:** Ensure “OST Draw.io” title/description (from 1.9), then add or complete: how to run (`npm run dev`), env (copy from env.example, list required vars), and links to [PRD](./PRD-ost-whiteboard-on-next-ai-draw-io.md) and [this plan](./PLAN-ost-draw-io-architecture.md). Add troubleshooting if useful.
- **docs:** Any remaining “next-ai-draw-io” references should be updated; run/env should be consistent with README.

**Validation:**
- [ ] README has “OST Draw.io”, run instructions, env, and links to PRD and this plan
- [ ] Env and run instructions are correct and consistent

---

### 4.2 (Optional) OST quick examples in UI

**Task:** Add or refine OST quick example buttons/cards in the chat panel so users can generate OST with one click or prefill (e.g. “Generate OST from product brief”, “OST from user research summary”).

**File(s):** Components that render “Quick Examples” (e.g. `components/chat-panel.tsx` or a dedicated examples component). i18n labels are in 2.2.

**Validation:**
- [ ] Clicking an OST example starts generation or prefills input appropriately

---

## Differentiation summary: next-ai-draw-io vs ost-draw-io

| Aspect | next-ai-draw-io | ost-draw-io |
|--------|------------------|-------------|
| **Folder / package** | next-ai-draw-io | ost-draw-io |
| **Product focus** | General AI diagramming | OST (Opportunity Solution Tree) |
| **Default UX** | “Describe your diagram or upload a file…” | “Upload context doc and problem statement to generate OST…” |
| **Header** | Next AI Drawio | OST Draw.io |
| **Storage / DB** | next-ai-draw-io-* | ost-draw-io-* |
| **Main flow** | Chat → any diagram | Upload + problem statement → OST generation → OST view |

---

## References

- **PRD:** [PRD-ost-whiteboard-on-next-ai-draw-io.md](./PRD-ost-whiteboard-on-next-ai-draw-io.md)
- **Logic / file map:** [logic.md](./logic.md)
- **Base repo:** [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)
- **Screenshot:** Main UI – canvas (left), chat panel “Next AI Drawio” (right), “Describe your diagram or upload a file…”, RECENT CHATS with OST examples

---

## Document history

| Version | Date       | Changes |
|---------|------------|---------|
| 1.0     | 2026-02-01 | Initial architecture plan. |
| 1.1     | 2026-02-01 | Detailed implementation plan: checklist with anchors, tech design, code snippets, developer instructions. |
| 1.2     | 2026-02-01 | Refactored checklist and implementation: aligned 1.1 heading/steps; 1.4 find-and-replace table; simplified 1.6; 1.7/1.8 file tables; 1.9 vs 4.1 README split; 2.1/2.2 i18n nav.appTitle; 2.3 scoped to title/description; Phase 3 merged 3.2 into 3.1, 3.2 wiring steps, optional 3.3; doc history. |

**Last updated:** 2026-02-01
