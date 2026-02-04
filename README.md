# OST Draw.io

<div align="center">

**Opportunity Solution Tree diagramming — upload context and problem statement, generate OST with AI**

English | [中文](./docs/cn/README_CN.md) | [日本語](./docs/ja/README_JA.md)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)

</div>

---

**OST Draw.io** is a web app for creating **Opportunity Solution Trees (OST)** with AI. Upload a context document (PDF, text) and a problem statement; the app uses an LLM to generate a draw.io-style OST diagram. You can then refine it via chat and edit it on the canvas.

- **OST-first flow:** Paste or type your problem statement, optionally attach context files, and send — the first message triggers OST generation with the right system prompt and diagram output.
- **General diagramming:** The same chat + canvas supports other diagrams (flowcharts, cloud architecture, etc.) via natural language.

Built on [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io). Implementation plan: [context/PLAN-ost-draw-io-architecture.md](./context/PLAN-ost-draw-io-architecture.md).

**Run from project root:** Open this repo in your editor (the folder with `package.json`), then run `npm run dev` from the integrated terminal. If you see `Can't resolve 'tailwindcss'`, you're likely not in the project root.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [MCP Server (Preview)](#mcp-server-preview)
- [Deployment](#deployment)
- [AI Providers](#ai-providers)
- [How It Works](#how-it-works)
- [FAQ & Support](#faq--support)

---

## Features

- **OST-first generation** — Problem statement + optional context (PDF/text) → AI generates an Opportunity Solution Tree as a draw.io diagram. First message uses an OST-optimized system prompt.
- **Chat-driven editing** — Refine the diagram in natural language; the AI can update or extend the OST.
- **File upload** — Attach PDFs and text files for context; content is extracted and included in the prompt.
- **AI reasoning (CoT)** — For supported models (OpenAI o1/o3, Gemini, Claude, etc.), the app can show the model’s reasoning before the diagram.
- **Diagram history** — View and restore previous diagram versions.
- **Multi-provider AI** — Use OpenAI, Anthropic, Google, Azure, Ollama, DeepSeek, and others (see [AI Providers](#ai-providers)).
- **Desktop app** — Electron build for Windows, macOS, and Linux.

---

## Getting Started

### Run locally

1. **Clone and install**

   ```bash
   git clone https://github.com/VictorChenLi/product-ai-draw-io.git
   cd product-ai-draw-io
   npm install
   cp env.example .env.local
   ```

2. **Configure an AI provider** in `.env.local` (see [env.example](./env.example) and [Provider Configuration Guide](./docs/en/ai-providers.md)).

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:6002](http://localhost:6002). Enter a problem statement (and optionally attach context files), then send to generate your first OST.

### Desktop app

Download the native app for your platform from the [Releases](https://github.com/VictorChenLi/product-ai-draw-io/releases) page (when available). Supports Windows, macOS, and Linux.

### Docker

See the [Docker guide](./docs/en/docker.md) for running with Docker.

---

## MCP Server (Preview)

Use OST Draw.io from AI agents (e.g. Claude Desktop, Cursor) via MCP:

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["@next-ai-drawio/mcp-server@latest"]
    }
  }
}
```

See the [MCP Server README](./packages/mcp-server/README.md) for details.

---

## Deployment

- **Vercel** — Clone this repo, connect to Vercel, and set the same env vars as in `.env.local`. See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).
- **Cloudflare Workers** — [Cloudflare deploy guide](./docs/en/cloudflare-deploy.md).
- **EdgeOne Pages** — [EdgeOne Pages](https://pages.edgeone.ai/) supports one-click deploy from a Git repo.

---

## AI Providers

Supported providers include: OpenAI, Anthropic, Google AI, Google Vertex AI, Azure OpenAI, AWS Bedrock, Ollama, OpenRouter, DeepSeek, ByteDance Doubao, SiliconFlow, ModelScope, SGLang, Vercel AI Gateway. Custom endpoints are supported for most (except AWS Bedrock and OpenRouter).

📖 **[Provider Configuration Guide](./docs/en/ai-providers.md)** — Setup per provider.

**Server-side models:** Admins can configure models via `AI_MODELS_CONFIG` (env) or `ai-models.json`, so users don’t need their own API keys. For OST and diagram generation, stronger models (e.g. Claude Sonnet, GPT-4, Gemini Pro, DeepSeek) are recommended because of the structured draw.io XML output.

---

## How It Works

- **Stack:** Next.js, [Vercel AI SDK](https://sdk.vercel.ai/) (`ai` + `@ai-sdk/*`), [react-drawio](https://github.com/nicholasgriffintn/react-drawio) for the canvas.
- **Diagrams** are draw.io XML; the AI returns or edits this XML, and the app renders it on the canvas.
- **OST flow:** For the first user message with an empty diagram, the chat API uses an OST system prompt and expects a diagram tool call; the response is parsed and loaded into the canvas (with automatic wrapping when the model returns bare mxCell XML).

---

## FAQ & Support

- **FAQ:** [docs/en/FAQ.md](./docs/en/FAQ.md)
- **Issues:** [GitHub Issues](https://github.com/VictorChenLi/product-ai-draw-io/issues)

This project is a fork of [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io), rebranded and extended for Opportunity Solution Tree diagramming.
