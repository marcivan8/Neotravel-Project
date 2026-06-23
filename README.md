# NeoTravel — Agent Backend (P2)

Vercel AI SDK agent that automates NeoTravel's commercial pipeline.
Stack: Next.js (App Router) · TypeScript · Vercel AI SDK · Airtable · Resend

---

## Setup

### 1 — Prerequisites
- Node.js 18+
- A GitHub repo (push this folder to it)
- Accounts on: OpenAI, Airtable, Resend, Vercel

### 2 — Install dependencies

```bash
npx create-next-app@latest . --typescript --app --no-tailwind --no-eslint --src-dir no
npm install ai @ai-sdk/openai zod
```

Then copy the files from this folder into your new Next.js project, preserving the folder structure.

### 4 — Environment variables

```bash
cp .env.example .env.local
# Fill in the values in .env.local
```

### 5 — Run locally

```bash
npm run dev
# Agent is live at http://localhost:3000/api/chat
```

### 5 — Test the API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Bonjour"}]}'
```

You should see a streaming response.

### 6 — Deploy to Vercel

```bash
git add . && git commit -m "feat: initial agent setup"
git push
# Vercel auto-deploys on push
# Add env variables in Vercel dashboard → Project → Settings → Environment Variables
```

---

## Project structure

```
app/
  api/
    chat/
      route.ts          ← Main streaming endpoint (P2 owns)
lib/
  system_prompt.ts      ← Agent persona and rules (P2 owns)
  airtable.ts           ← Airtable REST helper (P2 owns)
  tools/
    index.ts            ← Tool registry
    save_lead.ts        ← Creates a lead in Airtable
    update_status.ts    ← Updates pipeline status
    call_calculer_devis.ts  ← Pricing tool (stub until J4 — P5 delivers the real function)
    generate_pdf.ts     ← PDF generation (stub until J5 — P5 delivers)
    send_email.ts       ← Sends quote via Resend
    escalate.ts         ← HITL escalation
types/
  index.ts              ← Shared TypeScript types
```

---

## Integration points

| What | Who | When |
|------|-----|-------|
| Airtable table schema + field names | P4 | J1 — must sync before coding tools |
| `calculer_devis()` function | P5 | J4 — replace stub in `call_calculer_devis.ts` |
| PDF generator function | P5 | J5 — replace stub in `generate_pdf.ts` |
| Chat UI connecting to `/api/chat` | P3 | J3 — must confirm streaming format |

---

## Replacing the pricing stub (J4)

When P5 delivers `calculer_devis()`, open `lib/tools/call_calculer_devis.ts` and:

1. Replace the stub function with the real import:
   ```ts
   import { calculer_devis } from '@/lib/pricing/calculer_devis'
   ```
2. Replace the `calculer_devis_stub(...)` call with `calculer_devis(...)`
3. Run the unit tests P5 provides to confirm it works

---

## Key rules (do not break)

- **Never calculate a price outside `call_calculer_devis`.** The LLM never does arithmetic.
- **Always log tool calls** (`console.log` in each tool's `execute` function).
- **`maxSteps: 8`** allows the agent to chain tools (save → price → pdf → email) in one response.
- **`temperature: 0.2`** keeps data extraction reliable. Do not raise above 0.5.
