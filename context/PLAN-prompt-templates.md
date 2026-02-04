# Prompt Templates – Detailed Implementation Plan

Redesign “quick examples” as **prompt templates**: when the user selects a template (e.g. “OST from research/meeting notes” or “User flow for a solution”), the app (1) uses a corresponding system prompt for the first message and (2) sets the chat input placeholder so the user knows to paste or upload context. This plan implements two templates initially (OST, user-flow) and a registry so more can be added later.

**Instructions for developers:**
- Check off each item `[ ]` → `[x]` as you complete it.
- Each checklist item links to its detailed task section below (use anchor links).

---

## Progress Tracker (Checklist)

### Phase 0: Foundation (registry, types, user-flow prompt)
- [ ] [0.1](#01-template-registry-and-types) Template registry and types
- [ ] [0.2](#02-user-flow-system-prompt) User-flow system prompt

### Phase 1: API (chat route)
- [ ] [1.1](#11-chat-api-read-prompttemplateid-select-system-prompt) Chat API: read `promptTemplateId`, select system prompt

### Phase 2: i18n
- [ ] [2.1](#21-prompt-template-dictionary-keys) Prompt template dictionary keys

### Phase 3: Client state and request body
- [ ] [3.1](#31-selected-prompt-template-state) Selected prompt template state
- [ ] [3.2](#32-pass-prompttemplateid-in-chat-request-body) Pass `promptTemplateId` in chat request body

### Phase 4: UI (placeholder and lobby)
- [ ] [4.1](#41-chat-input-placeholder-from-selected-template) Chat input placeholder from selected template
- [ ] [4.2](#42-lobby-redesign-quick-examples-as-two-template-cards) Lobby: redesign quick examples as two template cards

### Phase 5: Optional and validation
- [ ] [5.1](#51-optional-persist-last-used-template) Optional: persist last-used template
- [ ] [5.2](#52-manual-test-and-cleanup) Manual test and cleanup

---

## Phase 0: Foundation (registry, types, user-flow prompt)

### 0.1 Template registry and types

**Task:** Add a central registry of prompt templates (id, system prompt key, i18n keys) and TypeScript types so the app has a single source of truth for “which templates exist” and “which system prompt each uses”.

**Files to check/update:**
- `lib/prompt-templates/types.ts` (new)
- `lib/prompt-templates/index.ts` (new)

**Implementation:**
1. Create `lib/prompt-templates/types.ts`:
   - Export `PromptTemplateId = "ost" | "user-flow"`.
   - Export `PromptTemplate` with: `id`, `labelKey`, `descriptionKey`, `placeholderKey`, `systemPromptKey`.
2. Create `lib/prompt-templates/index.ts`:
   - Define `PROMPT_TEMPLATES: PromptTemplate[]` with two entries: `ost` (labelKey/descriptionKey/placeholderKey pointing at e.g. `ost.label`, `ost.description`, `ost.placeholder`) and `user-flow` (e.g. `userFlow.label`, etc.).
   - Export `getPromptTemplateById(id: PromptTemplateId)` and optionally `getSystemPromptKeyForTemplate(id)`.
3. Ensure both templates have `systemPromptKey` set to the same id used server-side to resolve the system prompt (`ost` → OST_SYSTEM_PROMPT, `user-flow` → USER_FLOW_SYSTEM_PROMPT).

**Validation:**
- [ ] `getPromptTemplateById("ost")` and `getPromptTemplateById("user-flow")` return the correct template objects.
- [ ] Adding a new template later only requires one new entry in `PROMPT_TEMPLATES` and extending `PromptTemplateId`.

---

### 0.2 User-flow system prompt

**Task:** Add a dedicated system prompt for the “user flow for a solution” template so the API can use it when `promptTemplateId === "user-flow"`.

**Files to check/update:**
- `lib/user-flow/prompts.ts` (new) or `lib/prompts/user-flow.ts` (new)

**Implementation:**
1. Create a new file (e.g. `lib/user-flow/prompts.ts`).
2. Export `USER_FLOW_SYSTEM_PROMPT`: a string that instructs the model to generate a draw.io user flow diagram (steps, decisions, connectors, use display_diagram once, mxCell-only output, escape special chars, coordinates 0–800 x 0–600). Style can be minimal or aligned with OST (rounded shapes, clear labels).
3. Ensure the prompt specifies using the `display_diagram` tool with the same XML rules as OST (no wrapper tags, parent="1", unique ids from 2).

**Validation:**
- [ ] `USER_FLOW_SYSTEM_PROMPT` is exported and can be imported in `app/api/chat/route.ts`.

---

## Phase 1: API (chat route)

### 1.1 Chat API: read promptTemplateId, select system prompt

**Task:** For the first message with empty diagram, choose the system prompt based on request body `promptTemplateId` instead of always using OST.

**Files to check/update:**
- `app/api/chat/route.ts`

**Implementation:**
1. In the chat route, parse `promptTemplateId` from the request body (optional string) alongside `messages`, `xml`, `previousXml`, `sessionId`. Normalize to `templateId: string | null` (e.g. only accept `"ost"` or `"user-flow"` if you want strict validation).
2. Import `USER_FLOW_SYSTEM_PROMPT` from the new user-flow prompts file.
3. Replace the current “use OST for first message” logic with:
   - If not (first message and empty diagram), use `getSystemPrompt(modelId, minimalStyle)`.
   - Else if `templateId === "user-flow"`, use `USER_FLOW_SYSTEM_PROMPT`.
   - Else use `OST_SYSTEM_PROMPT` (for `"ost"` or missing/unknown).
4. Optionally adjust the second system message (diagram context) when using a template so user-flow says “user flow” instead of “Opportunity Solution Tree” where appropriate.

**Validation:**
- [ ] Sending first message with empty diagram and `promptTemplateId: "user-flow"` uses the user-flow system prompt; with `"ost"` or omitted uses OST.
- [ ] Non-first message or non-empty diagram still uses `getSystemPrompt(modelId, minimalStyle)`.

---

## Phase 2: i18n

### 2.1 Prompt template dictionary keys

**Task:** Add dictionary keys for template label, description, and input placeholder so the UI can show them.

**Files to check/update:**
- `lib/i18n/dictionaries/en.json`
- `lib/i18n/dictionaries/ja.json`, `zh.json`, `zh-Hant.json` (optional, same structure)

**Implementation:**
1. Add a top-level key (e.g. `promptTemplates`) with two entries: `ost` and `userFlow`.
2. Each entry has: `label`, `description`, `placeholder`.
   - **ost:** label e.g. “Generate OST from research or meeting notes”, description e.g. “Upload or paste research, meeting notes, or problem statement to generate an Opportunity Solution Tree.”, placeholder e.g. “Paste research, meeting notes, or problem statement… (or upload a file)”.
   - **userFlow:** label e.g. “Generate user flow for a solution”, description e.g. “Upload or paste solution description or user flow notes to generate a user flow diagram.”, placeholder e.g. “Paste solution description or user flow notes… (or upload a file)”.
3. Ensure the keys match what the template registry uses (e.g. `dict.promptTemplates.ost.placeholder`) and that the placeholder key is used in the chat input when that template is selected.

**Validation:**
- [ ] `dict.promptTemplates?.ost?.placeholder` and `dict.promptTemplates?.userFlow?.placeholder` exist and render when wired in Phase 4.

---

## Phase 3: Client state and request body

### 3.1 Selected prompt template state

**Task:** Track which prompt template is selected so the client can set the input placeholder and send `promptTemplateId` with the chat request.

**Files to check/update:**
- `components/chat-panel.tsx`

**Implementation:**
1. Add state: `const [selectedPromptTemplateId, setSelectedPromptTemplateId] = useState<PromptTemplateId | null>("ost")` (or `null` if you prefer no default). Use type `PromptTemplateId` from `lib/prompt-templates/types`.
2. Ensure the lobby/example panel can update this state (e.g. via `onSelectPromptTemplate(templateId)` or by calling `setSelectedPromptTemplateId` passed as prop).

**Validation:**
- [ ] Selecting a template in the lobby (Phase 4.2) updates `selectedPromptTemplateId`; value is available when building the request in 3.2.

---

### 3.2 Pass promptTemplateId in chat request body

**Task:** Include the selected template id in the body of the chat API request so the server can choose the system prompt.

**Files to check/update:**
- `components/chat-panel.tsx` (same as 3.1)

**Implementation:**
1. In `sendChatMessage`, extend the `body` object passed to `sendMessage` with `promptTemplateId` when a template is selected: e.g. `body: { xml, previousXml, sessionId, ...(selectedPromptTemplateId && { promptTemplateId: selectedPromptTemplateId }) }`.
2. Ensure `sendChatMessage` closes over `selectedPromptTemplateId` (same component). If the function is passed to children, ensure they use the same state.

**Validation:**
- [ ] Request payload to `/api/chat` includes `promptTemplateId: "ost"` or `"user-flow"` when a template is selected; server uses it in Phase 1.1.

---

## Phase 4: UI (placeholder and lobby)

### 4.1 Chat input placeholder from selected template

**Task:** Show template-specific placeholder text in the chat input so users know to paste or upload context.

**Files to check/update:**
- `components/chat-panel.tsx`
- `components/chat-input.tsx` (if placeholder is not already a prop)

**Implementation:**
1. In `chat-panel.tsx`, compute placeholder from the selected template and dict: e.g. if `selectedPromptTemplateId === "ost"` use `dict.promptTemplates?.ost?.placeholder`, if `"user-flow"` use `dict.promptTemplates?.userFlow?.placeholder`, else fallback to `dict.chat.placeholder`.
2. Pass this value into `ChatInput` as a prop (e.g. `placeholder={inputPlaceholder}`). If `ChatInput` currently only uses `dict.chat.placeholder` internally, add an optional prop and use it when provided, otherwise keep the default.

**Validation:**
- [ ] With OST template selected, the input shows the OST placeholder; with user-flow selected, the user-flow placeholder; with none selected, the default chat placeholder.

---

### 4.2 Lobby: redesign quick examples as two template cards

**Task:** Replace the current quick-examples grid with two prompt-template cards. Clicking a card selects that template and optionally focuses the input or pre-fills a single hint line.

**Files to check/update:**
- `components/chat-example-panel.tsx`
- `components/chat/ChatLobby.tsx` (if it renders the example panel and must pass new props)

**Implementation:**
1. Add props to the example panel (or lobby): `selectedPromptTemplateId`, `onSelectPromptTemplate(templateId: PromptTemplateId)`.
2. Render two cards only (for now):
   - Card 1: “Generate OST from research or meeting notes” (use i18n key from Phase 2). On click: `onSelectPromptTemplate("ost")`. Optionally `setInput("")` or a one-line hint.
   - Card 2: “Generate user flow for a solution”. On click: `onSelectPromptTemplate("user-flow")`. Optionally `setInput("")` or a one-line hint.
3. Visually indicate the active template (e.g. border or background) when `selectedPromptTemplateId` matches the card.
4. Remove or repurpose the old example cards (e.g. “Replicate flowchart”, “Creative drawing”, “OST from user research”, “AWS architecture”) so the lobby is focused on “pick a template”. Keep MCP/server notice if desired.
5. Optional: when a template card is clicked, focus the chat input (e.g. set `shouldFocusInput` or call input ref) so the user can paste immediately.

**Validation:**
- [ ] Lobby shows exactly two template cards; selecting one updates `selectedPromptTemplateId` and the input placeholder (4.1); user can paste/upload and send; API receives the correct `promptTemplateId` (3.2, 1.1).

---

## Phase 5: Optional and validation

### 5.1 Optional: persist last-used template

**Task:** Remember the last selected template (e.g. in sessionStorage) so that new chats or page refresh keep the same template.

**Files to check/update:**
- `components/chat-panel.tsx`
- Optionally `lib/storage.ts` for a constant key (e.g. `ost-draw-io-prompt-template-id`)

**Implementation:**
1. When `setSelectedPromptTemplateId` is called with a valid id, write to sessionStorage (e.g. key `ost-draw-io-prompt-template-id`, value `"ost"` or `"user-flow"`).
2. On mount or when the chat panel becomes visible, read from sessionStorage and set initial `selectedPromptTemplateId` if the value is a valid `PromptTemplateId`.
3. Document whether “new chat” clears the template or keeps the last one (recommendation: keep last one for consistency with other products).

**Validation:**
- [ ] After selecting a template and refreshing the page, the same template remains selected and the placeholder matches.

---

### 5.2 Manual test and cleanup

**Task:** Verify end-to-end behavior and remove or refactor obsolete code.

**Files to check/update:**
- Any files that still reference old “quick example” handlers or unused i18n keys
- Docs or `context/` notes that mention “quick examples”

**Implementation:**
1. Test OST template: select “OST from research/meeting notes”, paste context, send. Confirm the first message uses the OST system prompt and the diagram is an OST.
2. Test user-flow template: select “User flow for a solution”, paste context, send. Confirm the first message uses the user-flow system prompt and the diagram is a flow.
3. If “no template” is supported, test that the default system prompt and placeholder are used.
4. Remove or refactor unused handlers (e.g. `handlePdfExample`, `handleReplicateArchitecture`) and related i18n keys if they are no longer used.
5. Update any user-facing or internal docs to say “prompt templates” instead of “quick examples” where appropriate.

**Validation:**
- [ ] Both templates work end-to-end; no broken references; documentation is consistent.

---

## Reference: design research summary

- **SystemSculpt:** System prompt chip above the input; click opens selector with presets and custom prompts; per-chat selection; optional “last choice” for new chats.
- **Cursor:** Prompt templates by category; custom modes/rules (global vs project).
- **Notion AI:** Template libraries; use-case labels; selecting a template implies the “mode” and pre-fills or structures the user prompt.
- **This app:** Two templates (OST, user-flow); template selection sets system prompt for first message + empty diagram and sets input placeholder; extensible via registry.

---

## File change summary

| Area              | Files |
|-------------------|-------|
| Registry & types  | `lib/prompt-templates/types.ts`, `lib/prompt-templates/index.ts` |
| User-flow prompt  | `lib/user-flow/prompts.ts` (or equivalent) |
| API               | `app/api/chat/route.ts` |
| i18n              | `lib/i18n/dictionaries/en.json` (+ ja, zh, zh-Hant) |
| Client state/send | `components/chat-panel.tsx` |
| Input placeholder| `components/chat-panel.tsx`, `components/chat-input.tsx` |
| Lobby/templates   | `components/chat-example-panel.tsx`, `components/chat/ChatLobby.tsx` |
| Optional persist  | `components/chat-panel.tsx`, sessionStorage |
