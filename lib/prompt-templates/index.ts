import type { PromptTemplate, PromptTemplateId } from "./types"

/**
 * Registry of prompt templates. Single source of truth for which templates exist
 * and which system prompt / i18n keys each uses.
 */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
        id: "ost",
        labelKey: "promptTemplates.ost.label",
        descriptionKey: "promptTemplates.ost.description",
        placeholderKey: "promptTemplates.ost.placeholder",
        systemPromptKey: "ost",
    },
    {
        id: "user-flow",
        labelKey: "promptTemplates.userFlow.label",
        descriptionKey: "promptTemplates.userFlow.description",
        placeholderKey: "promptTemplates.userFlow.placeholder",
        systemPromptKey: "user-flow",
    },
]

/**
 * Get a template by id. Returns undefined if id is not in the registry.
 */
export function getPromptTemplateById(
    id: PromptTemplateId | string | null,
): PromptTemplate | undefined {
    if (id === null || id === undefined) return undefined
    return PROMPT_TEMPLATES.find((t) => t.id === id)
}

/**
 * Get the system prompt key for a template (used server-side to select OST_SYSTEM_PROMPT vs USER_FLOW_SYSTEM_PROMPT).
 * Returns undefined if id is unknown.
 */
export function getSystemPromptKeyForTemplate(
    id: PromptTemplateId | string | null,
): PromptTemplateId | undefined {
    const template = getPromptTemplateById(id)
    return template?.systemPromptKey
}

export type { PromptTemplate, PromptTemplateId } from "./types"
