import type { ClientOverrides } from "@/lib/ai-providers"
import { extractTextFromFile } from "@/lib/ost/extractFileText"
import { generateOSTRaw } from "@/lib/ost/generateOST"
import { findServerModelById } from "@/lib/server-model-config"

export const maxDuration = 120

function buildClientOverrides(req: Request): Promise<ClientOverrides> {
    const provider = req.headers.get("x-ai-provider")
    let baseUrl = req.headers.get("x-ai-base-url")
    const selectedModelId = req.headers.get("x-selected-model-id")

    if (provider === "edgeone" && !baseUrl) {
        const origin = req.headers.get("origin") || new URL(req.url).origin
        baseUrl = `${origin}/api/edgeai`
    }

    const cookieHeader = req.headers.get("cookie")

    return (async () => {
        let serverModelConfig: {
            apiKeyEnv?: string | string[]
            baseUrlEnv?: string
            provider?: string
        } = {}
        if (selectedModelId?.startsWith("server:")) {
            const serverModel = await findServerModelById(selectedModelId)
            if (serverModel) {
                serverModelConfig = {
                    apiKeyEnv: serverModel.apiKeyEnv,
                    baseUrlEnv: serverModel.baseUrlEnv,
                    provider: serverModel.provider,
                }
            }
        }

        const resolvedProvider =
            serverModelConfig.provider ?? provider ?? undefined
        return {
            baseUrl,
            apiKey: req.headers.get("x-ai-api-key"),
            modelId: req.headers.get("x-ai-model"),
            awsAccessKeyId: req.headers.get("x-aws-access-key-id"),
            awsSecretAccessKey: req.headers.get("x-aws-secret-access-key"),
            awsRegion: req.headers.get("x-aws-region"),
            awsSessionToken: req.headers.get("x-aws-session-token"),
            ...serverModelConfig,
            provider: resolvedProvider,
            vertexApiKey: req.headers.get("x-vertex-api-key"),
            ...(provider === "edgeone" &&
                cookieHeader && {
                    headers: { cookie: cookieHeader },
                }),
        }
    })()
}

export async function POST(req: Request): Promise<Response> {
    // Access code check (same as chat)
    const accessCodes =
        process.env.ACCESS_CODE_LIST?.split(",")
            ?.map((c) => c.trim())
            .filter(Boolean) || []
    if (accessCodes.length > 0) {
        const code = req.headers.get("x-access-code")
        if (!code || !accessCodes.includes(code)) {
            return Response.json(
                {
                    error: "Invalid or missing access code. Please configure it in Settings.",
                },
                { status: 401 },
            )
        }
    }

    const contentType = req.headers.get("content-type") ?? ""
    let context = ""

    try {
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData()
            const file = formData.get("file") as File | null
            const problemStatement =
                (formData.get("context") as string | null) ??
                (formData.get("problemStatement") as string | null) ??
                ""
            if (file && file.size > 0) {
                const fileText = await extractTextFromFile(file)
                context = [fileText, problemStatement]
                    .filter(Boolean)
                    .join("\n\n")
            } else {
                context = String(problemStatement).trim()
            }
        } else {
            const body = await req.json().catch(() => ({}))
            context =
                typeof (body as { context?: string }).context === "string"
                    ? (body as { context: string }).context
                    : ""
        }

        const clientOverrides = await buildClientOverrides(req)
        const raw = await generateOSTRaw({ context, ...clientOverrides })
        return Response.json({ raw })
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "OST generation failed"
        console.error("[ost/generate]", message, err)
        return Response.json({ error: message }, { status: 500 })
    }
}
