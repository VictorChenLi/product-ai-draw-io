/**
 * OST generation: call AI with OST prompt and return draw.io XML from display_diagram tool.
 * Used by POST /api/ost/generate.
 */

import { generateText } from "ai"
import { z } from "zod"
import type { ClientOverrides } from "@/lib/ai-providers"
import { getAIModel } from "@/lib/ai-providers"
import { buildOSTUserPrompt, OST_SYSTEM_PROMPT } from "@/lib/ost/prompts"

const displayDiagramSchema = z.object({
    xml: z.string().describe("draw.io mxCell XML (no wrapper tags)"),
})

/**
 * Generate OST diagram XML from context (problem statement + optional file text).
 * Uses the same model/headers pattern as the chat route; returns the raw XML from display_diagram.
 */
export async function generateOSTRaw({
    context,
    ...clientOverrides
}: {
    context: string
} & ClientOverrides): Promise<string> {
    const { model, headers } = getAIModel(clientOverrides)
    const userPrompt = buildOSTUserPrompt(context)

    const result = await generateText({
        model,
        system: OST_SYSTEM_PROMPT,
        prompt: userPrompt,
        maxOutputTokens: 8192,
        ...(headers && { headers }),
        tools: {
            display_diagram: {
                description:
                    "Output the Opportunity Solution Tree as draw.io mxCell XML. Generate ONLY mxCell elements; no wrapper tags. Use unique ids from 2, parent='1'. Escape special chars: &lt; &gt; &amp; &quot;",
                inputSchema: displayDiagramSchema,
            },
        },
        toolChoice: "required",
    })

    const toolCalls = result.toolCalls ?? []
    const displayCall = toolCalls.find(
        (c: { toolName: string }) => c.toolName === "display_diagram",
    )
    if (!displayCall) {
        throw new Error(
            "OST generation did not return a display_diagram tool call. Please try again.",
        )
    }
    const input = (displayCall as { input?: { xml?: string } }).input
    const xml = input?.xml?.trim()
    if (!xml) {
        throw new Error(
            "OST generation returned empty diagram XML. Please try again.",
        )
    }
    return xml
}
