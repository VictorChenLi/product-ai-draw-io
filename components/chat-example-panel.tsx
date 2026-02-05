"use client"

import { FileText, GitBranch } from "lucide-react"
import { useDictionary } from "@/hooks/use-dictionary"
import type { PromptTemplateId } from "@/lib/prompt-templates"

interface TemplateCardProps {
    icon: React.ReactNode
    title: string
    description: string
    onClick: () => void
    isSelected?: boolean
}

function TemplateCard({
    icon,
    title,
    description,
    onClick,
    isSelected,
}: TemplateCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group w-full text-left p-4 rounded-xl border bg-card hover:accent/50 transition-all duration-200 hover:shadow-sm ${
                isSelected
                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                    : "border-border/60 hover:border-primary/30 hover:bg-accent/50"
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                            ? "bg-primary/20"
                            : "bg-primary/10 group-hover:bg-primary/15"
                    }`}
                >
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    )
}

export default function ExamplePanel({
    setInput,
    setFiles,
    minimal = false,
    selectedPromptTemplateId,
    onSelectPromptTemplate,
}: {
    setInput: (input: string) => void
    setFiles: (files: File[]) => void
    minimal?: boolean
    selectedPromptTemplateId?: PromptTemplateId | null
    onSelectPromptTemplate?: (templateId: PromptTemplateId) => void
}) {
    const dict = useDictionary()

    const handleSelectTemplate = (templateId: PromptTemplateId) => {
        onSelectPromptTemplate?.(templateId)
        setInput("")
        setFiles([])
    }

    const ostLabel =
        dict.promptTemplates?.ost?.label ??
        "Generate OST from research or meeting notes"
    const ostDescription =
        dict.promptTemplates?.ost?.description ??
        "Upload or paste research, meeting notes, or problem statement to generate an Opportunity Solution Tree."
    const userFlowLabel =
        dict.promptTemplates?.userFlow?.label ??
        "Generate user flow for a solution"
    const userFlowDescription =
        dict.promptTemplates?.userFlow?.description ??
        "Upload or paste solution description or user flow notes to generate a user flow diagram."

    return (
        <div className={minimal ? "" : "py-6 px-2 animate-fade-in"}>
            {!minimal && (
                <>
                    {/* Welcome section */}
                    <div className="text-center mb-6">
                        <h2 className="text-lg font-semibold text-foreground mb-2">
                            {dict.examples?.title ?? "Create OST with AI"}
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {dict.examples?.subtitle ??
                                "Upload a problem statement or context doc to generate an Opportunity Solution Tree"}
                        </p>
                    </div>
                </>
            )}

            {/* Template cards */}
            <div className="space-y-3">
                {!minimal && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                        {dict.examples?.quickExamples ?? "Quick Examples"}
                    </p>
                )}

                <div className="grid gap-2">
                    <TemplateCard
                        icon={<FileText className="w-4 h-4 text-primary" />}
                        title={ostLabel}
                        description={ostDescription}
                        onClick={() => handleSelectTemplate("ost")}
                        isSelected={selectedPromptTemplateId === "ost"}
                    />
                    <TemplateCard
                        icon={<GitBranch className="w-4 h-4 text-primary" />}
                        title={userFlowLabel}
                        description={userFlowDescription}
                        onClick={() => handleSelectTemplate("user-flow")}
                        isSelected={selectedPromptTemplateId === "user-flow"}
                    />
                </div>

                <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
                    {dict.examples?.cachedNote ??
                        "Examples are cached for instant response"}
                </p>
            </div>
        </div>
    )
}
