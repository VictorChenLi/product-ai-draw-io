/**
 * Prompt template identifiers. Used by the chat API to select the system prompt
 * for the first message when the diagram is empty.
 */
export type PromptTemplateId = "ost" | "user-flow"

/**
 * Metadata for a single prompt template. i18n keys point into the dictionary
 * (e.g. promptTemplates.ost.label). systemPromptKey is the id used server-side
 * to resolve the system prompt (ost → OST_SYSTEM_PROMPT, user-flow → USER_FLOW_SYSTEM_PROMPT).
 */
export interface PromptTemplate {
    id: PromptTemplateId
    /** Dictionary path for template label, e.g. "promptTemplates.ost.label" */
    labelKey: string
    /** Dictionary path for template description, e.g. "promptTemplates.ost.description" */
    descriptionKey: string
    /** Dictionary path for chat input placeholder, e.g. "promptTemplates.ost.placeholder" */
    placeholderKey: string
    /** Id used server-side to select system prompt: "ost" | "user-flow" */
    systemPromptKey: PromptTemplateId
}
