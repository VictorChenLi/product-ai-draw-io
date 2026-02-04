/**
 * Server-side file text extraction for OST context.
 * Reuses pdf-utils for PDF and text files; used by /api/ost/generate.
 */

import {
    extractPdfText,
    extractTextFileContent,
    isPdfFile,
    isTextFile,
    MAX_EXTRACTED_CHARS,
} from "@/lib/pdf-utils"

/**
 * Extract text from a file (PDF or supported text types).
 * Used when processing multipart/form-data in /api/ost/generate.
 */
export async function extractTextFromFile(file: File): Promise<string> {
    if (isPdfFile(file)) {
        const text = await extractPdfText(file)
        return text.length > MAX_EXTRACTED_CHARS
            ? text.slice(0, MAX_EXTRACTED_CHARS) + "\n\n[Text truncated…]"
            : text
    }
    if (isTextFile(file)) {
        const text = await extractTextFileContent(file)
        return text.length > MAX_EXTRACTED_CHARS
            ? text.slice(0, MAX_EXTRACTED_CHARS) + "\n\n[Text truncated…]"
            : text
    }
    throw new Error(
        `Unsupported file type for text extraction: ${file.name}. Use PDF or text files (.txt, .md, .json, etc.).`,
    )
}
