# OST Draw.io

**Opportunity Solution Tree diagramming — upload context and problem statement, generate OST with AI.**

This app creates **Opportunity Solution Trees (OST)** with AI: you provide a problem statement and optional context (PDF or text); the first message triggers OST generation and a draw.io diagram. You can refine the diagram via chat and edit it on the canvas.

**Based on:** [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)

---

## This project

- **Implementation plan:** [context/PLAN-ost-draw-io-architecture.md](./context/PLAN-ost-draw-io-architecture.md)
- **OST-first flow:** First message (problem statement ± context files) uses an OST system prompt and produces a draw.io OST diagram.
- **Chat + canvas:** Refine or extend the OST in natural language; diagram history is available.

---

## Run locally

From the **project root** (folder containing `package.json`):

```bash
git clone https://github.com/VictorChenLi/product-ai-draw-io.git
cd product-ai-draw-io
npm install
cp env.example .env.local
```

Set your AI provider in `.env.local` (see [env.example](./env.example)), then:

```bash
npm run dev
```

Open [http://localhost:6002](http://localhost:6002), enter a problem statement (and optionally attach context files), and send to generate an OST.

If you see `Can't resolve 'tailwindcss'`, run `npm run dev` from the project root in your editor’s terminal.

---

## Issues

[Open an issue](https://github.com/VictorChenLi/product-ai-draw-io/issues) on this repo.
