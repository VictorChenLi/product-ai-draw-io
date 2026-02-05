// Centralized localStorage keys for quota tracking and settings
// Chat data is now stored in IndexedDB via session-storage.ts

export const STORAGE_KEYS = {
    // Quota tracking
    requestCount: "ost-draw-io-request-count",
    requestDate: "ost-draw-io-request-date",
    tokenCount: "ost-draw-io-token-count",
    tokenDate: "ost-draw-io-token-date",
    tpmCount: "ost-draw-io-tpm-count",
    tpmMinute: "ost-draw-io-tpm-minute",

    // Settings
    accessCode: "ost-draw-io-access-code",
    accessCodeRequired: "ost-draw-io-access-code-required",
    aiProvider: "ost-draw-io-ai-provider",
    aiBaseUrl: "ost-draw-io-ai-base-url",
    aiApiKey: "ost-draw-io-ai-api-key",
    aiModel: "ost-draw-io-ai-model",

    // Multi-model configuration
    modelConfigs: "ost-draw-io-model-configs",
    selectedModelId: "ost-draw-io-selected-model-id",

    // Chat input preferences
    sendShortcut: "ost-draw-io-send-shortcut",

    // Prompt template (sessionStorage: last-used template for new chats)
    promptTemplateId: "ost-draw-io-prompt-template-id",

    // Diagram validation
    vlmValidationEnabled: "ost-draw-io-vlm-validation-enabled",
} as const
