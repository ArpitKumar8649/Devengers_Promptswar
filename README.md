# 🇮🇳 Smart Bharat — AI-Powered Civic Companion

GenAI civic companion for **DEVENGERS PromptWars 2026 × Global Prompt Challenge**.
Helps Indian citizens access government services, report public issues, and get
personalized **multilingual** assistance — powered by **Qwen models via Alibaba Cloud DashScope**.

## ✨ Stack

- **Next.js (App Router)** + TypeScript + Tailwind CSS
- **Qwen (DashScope)** via the OpenAI-compatible API — streaming responses
- Deploy on **Vercel** in one click

## 🚀 Local setup

```bash
npm install
cp .env.example .env.local   # then paste your DashScope key
npm run dev                  # http://localhost:3000
```

### Environment variables

| Var | What | Example |
|-----|------|---------|
| `DASHSCOPE_API_KEY` | Key from [Alibaba Cloud Model Studio](https://modelstudio.console.alibabacloud.com) | `sk-xxxx` |
| `DASHSCOPE_BASE_URL` | OpenAI-compatible base URL | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| `QWEN_MODEL` | Model id | `qwen-plus` \| `qwen-flash` \| `qwen-max` |

> New Alibaba Cloud accounts get free trial tokens per model. Use the **International**
> endpoint (`dashscope-intl…`) with an international API key, or the Beijing endpoint
> (`dashscope.aliyuncs.com`) with a China key — keys are **not** interchangeable.

## ☁️ Deploy to Vercel

1. Push this repo to GitHub (public).
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the three env vars above in **Project → Settings → Environment Variables**.
4. Deploy. Done.

## 🧠 How the AI works

- `lib/qwen.ts` — lazy DashScope client (OpenAI-compatible).
- `app/api/chat/route.ts` — streaming chat endpoint with a civic-companion system prompt
  (plain-language explanations, document guidance, multilingual — replies in the user's language).
- `components/civic-chat.tsx` — streaming chat UI with quick civic prompts.

Swap the model with `QWEN_MODEL`, or extend the system prompt / add tools for
scheme eligibility, complaint tracking, and document checklists.

---

Built for the **Smart Bharat** challenge · transparency · accessibility · digital inclusion.
