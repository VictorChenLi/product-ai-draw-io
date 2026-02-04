import { GoogleAnalytics } from "@next/third-parties/google"
import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"
import { notFound } from "next/navigation"
import { DiagramProvider } from "@/contexts/diagram-context"
import { DictionaryProvider } from "@/hooks/use-dictionary"
import type { Locale } from "@/lib/i18n/config"
import { i18n } from "@/lib/i18n/config"
import { getDictionary, hasLocale } from "@/lib/i18n/dictionaries"

import "../globals.css"

const plusJakarta = Plus_Jakarta_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
})

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

// Generate static params for all locales
export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }))
}

// Generate metadata per locale
export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>
}): Promise<Metadata> {
    const { lang: rawLang } = await params
    const lang = (
        rawLang in { en: 1, zh: 1, ja: 1, "zh-Hant": 1 } ? rawLang : "en"
    ) as Locale

    // OST Draw.io metadata (base URL: set to your deployment domain)
    const baseUrl = "https://ost-draw-io.example.com"
    const titles: Record<Locale, string> = {
        en: "OST Draw.io – Opportunity Solution Tree diagramming",
        zh: "OST Draw.io – 機會解決樹圖表",
        ja: "OST Draw.io – 機会ソリューションツリー図",
        "zh-Hant": "OST Draw.io – 機會解決樹圖表",
    }

    const descriptions: Record<Locale, string> = {
        en: "OST Draw.io – Generate Opportunity Solution Trees from context and problem statements. AI-powered diagramming for product discovery.",
        zh: "OST Draw.io – 從情境與問題陳述生成機會解決樹。AI 驅動的產品探索圖表。",
        ja: "OST Draw.io – コンテキストと問題提起から機会ソリューションツリーを生成。AI による図解。",
        "zh-Hant":
            "OST Draw.io – 從情境與問題陳述生成機會解決樹。AI 驅動的產品探索圖表。",
    }

    return {
        title: titles[lang],
        description: descriptions[lang],
        keywords: [
            "OST",
            "Opportunity Solution Tree",
            "diagram",
            "draw.io",
            "AI diagram",
            "product discovery",
            "outcome-focused",
        ],
        authors: [{ name: "OST Draw.io" }],
        creator: "OST Draw.io",
        publisher: "OST Draw.io",
        metadataBase: new URL(baseUrl),
        openGraph: {
            title: titles[lang],
            description: descriptions[lang],
            type: "website",
            url: baseUrl,
            siteName: "OST Draw.io",
            locale:
                lang === "zh"
                    ? "zh_CN"
                    : lang === "zh-Hant"
                      ? "zh_HK"
                      : lang === "ja"
                        ? "ja_JP"
                        : "en_US",
            images: [
                {
                    url: "/architecture.png",
                    width: 1200,
                    height: 630,
                    alt: "OST Draw.io – Opportunity Solution Tree diagramming",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: titles[lang],
            description: descriptions[lang],
            images: ["/architecture.png"],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        icons: {
            icon: "/favicon.ico",
        },
        alternates: {
            languages: {
                en: "/en",
                zh: "/zh",
                ja: "/ja",
                "zh-Hant": "/zh-Hant",
            },
        },
    }
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode
    params: Promise<{ lang: string }>
}>) {
    const { lang } = await params
    if (!hasLocale(lang)) notFound()
    const validLang = lang as Locale
    const dictionary = await getDictionary(validLang)

    const baseUrl = "https://ost-draw-io.example.com"
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "OST Draw.io",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web Browser",
        description:
            "OST Draw.io – Generate Opportunity Solution Trees from context and problem statements. AI-powered diagramming for product discovery.",
        url: baseUrl,
        inLanguage: validLang,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
    }

    return (
        <html lang={validLang} suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body
                className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
            >
                <DictionaryProvider dictionary={dictionary}>
                    <DiagramProvider>{children}</DiagramProvider>
                </DictionaryProvider>
            </body>
            {process.env.NEXT_PUBLIC_GA_ID && (
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            )}
        </html>
    )
}
