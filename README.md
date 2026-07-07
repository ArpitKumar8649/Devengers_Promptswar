<div align="center">

# 🇮🇳 Smart Bharat — "Saathi"

### An AI-Powered Civic Companion for Every Indian

**Access government services, report public issues, and get personalized help — spoken in your own language.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-devengers--promptswar.vercel.app-FF9933?style=for-the-badge)](https://devengers-promptswar.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Qwen](https://img.shields.io/badge/AI-Alibaba_Qwen-6E56CF?style=for-the-badge)](https://www.alibabacloud.com/help/en/model-studio/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

Built solo in ~4 hours for **DEVENGERS PromptWars 2026 × Global Prompt Challenge**
*(Hack2Skill × Google for Developers)*

**Challenge:** *Smart Bharat – AI-Powered Civic Companion*

</div>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Live Demo & Quick Start](#-live-demo--quick-start)
- [How It Maps to the Challenge](#-how-it-maps-to-the-challenge)
- [Features Deep-Dive](#-features-deep-dive)
- [Architecture](#-architecture)
- [The AI Layer (DashScope Qwen)](#-the-ai-layer-dashscope-qwen)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Running Locally](#-running-locally)
- [Prompt Engineering Strategy](#-prompt-engineering-strategy)
- [Engineering Decisions That Matter](#-engineering-decisions-that-matter)
- [Real-World Impact](#-real-world-impact)
- [Roadmap](#-roadmap)

---

## 🎯 The Problem

Accessing government services in India is rarely blocked by *eligibility*. It's blocked by the **interface** — endless forms, bureaucratic English, a maze of disconnected portals, and documents nobody ever explains.

The result: millions of citizens never claim the schemes, benefits, and resolutions they're entitled to — not because they don't qualify, but because the system was never built to be *understood*.

The people most affected are exactly those with the least margin to spare: **rural, elderly, low-literacy, and non-English-speaking citizens.**

> The real digital divide isn't internet access. It's forms, language, and the quiet fear of official paper.

---

## 💡 The Solution

**Smart Bharat** replaces the interface itself — not with another portal, but with a **conversation**.

Meet **Saathi** (साथी, "companion") — one GenAI-powered web platform that unifies **six civic superpowers** behind a single AI brain and a single language setting:

| | Feature | What it does |
|---|---|---|
| 📸 | **Samasya** | Snap a photo of a civic issue → AI classifies it, rates severity, routes it to the right department, pins the location on a live map, and drafts a filed-ready bilingual complaint with a tracking ID |
| 💬 | **Baat Karo** | A streaming multilingual chat companion that answers civic questions in plain words |
| 🎯 | **Yojana** | Describe your life in one line → discover the welfare schemes you're eligible for, with exact amounts and documents |
| 📄 | **Kaagaz** | Upload a confusing government letter → get a plain-language explanation, a checklist, and read-aloud |
| 📋 | **Track** | Follow every complaint through *Filed → Acknowledged → In Progress → Resolved* |
| 🗣️ | **Multilingual** | Hindi, Tamil, Bengali, Marathi, Telugu & English — the chosen language flows into **every** AI response |

The core insight: the challenge lists **six distinct capabilities**. Most teams build a chatbot that does one. Saathi treats all six as **purpose-built surfaces on one AI brain** — that's the difference between a demo and a product.

---

## 🚀 Live Demo & Quick Start

### ▶️ [**devengers-promptswar.vercel.app**](https://devengers-promptswar.vercel.app)

**No sign-up required.** Click **"Explore in Demo Mode"** to enter instantly.

**Try this 60-second flow:**
1. Switch the language (top-right) to **हिन्दी** or **தமிழ்** — watch every response adapt
2. Open **Samasya** → tap *Use sample photo* → *Detect location* → **Analyse & File Complaint**
3. Watch the AI classify the issue, route it to the correct municipal body, and hand you a tracking ID
4. Open **Yojana** → type *"58, widow, no land, low income"* → see the schemes she's owed
5. Open **Track** → follow the complaint you just filed

---

## ✅ How It Maps to the Challenge

Every requirement in the problem statement maps to a concrete, working feature — nothing is aspirational:

| Problem-statement requirement | Delivered by | Powered by |
|---|---|---|
| Answer citizen queries | 💬 Baat Karo | `qwen3.7-max` (streaming) |
| Simplify complex govt information | 💬 Baat Karo + 📄 Kaagaz | `qwen3.7-max` / `qwen-vl-max` |
| Report public issues | 📸 Samasya | `qwen-vl-max` (vision) |
| Recommend relevant public services | 🎯 Yojana | `qwen3.7-max` (JSON) |
| Assist with document requirements | 📄 Kaagaz + 🎯 Yojana | `qwen-vl-max` / `qwen3.7-max` |
| Track complaints | 📋 Track | localStorage + optional Firestore |
| Multilingual support | 🌐 Global language layer | injected into every prompt |

---

## 🔍 Features Deep-Dive

### 📸 Samasya — Report a public issue from a single photo
The flagship feature and the technical centerpiece.

- **Camera-first capture** — take a photo of a pothole, garbage pile, or broken streetlight (images are resized client-side to ~1024px before upload for speed and quota efficiency)
- **Live geolocation + map** — one tap detects your GPS location, drops a draggable 📍 pin on an **OpenStreetMap** (Leaflet) map, and **reverse-geocodes** it (via Nominatim) into a street address + city
- **Multimodal AI analysis** — `qwen-vl-max` returns structured JSON: the issue type, a **1–5 severity score with a public-safety rationale**, the correct **municipal department**, and the responsible authority
- **Authority grounding** — the department is matched against a curated per-city dataset (Chennai → Greater Chennai Corp, Mumbai → BMC, etc.) rather than trusting the model's guess
- **Bilingual complaint drafting** — a formal, ready-to-file complaint letter in **both English and the citizen's language**, with the detected address woven in — copy or download as `.txt`
- **Instant tracking** — a tracking ID is generated and the complaint flows straight into the Track timeline

### 💬 Baat Karo — Conversational civic companion
- Real-time **token-by-token streaming** responses
- A carefully tuned system persona: calm, honest, and **never fabricates** scheme names or numbers
- Replies in the citizen's selected language, regardless of the language they type in

### 🎯 Yojana — Scheme & service recommender
- Type or describe your situation in one line
- AI performs **fuzzy, humane eligibility reasoning** over a curated scheme catalogue (PM-Kisan, Ayushman Bharat, PMAY, NSP scholarships, widow/old-age pensions, Ujjwala, e-Shram, and more)
- Returns ranked schemes with **benefit amounts, the exact documents needed, and *why* you qualify**
- A **"Deep reasoning" toggle** switches on Qwen's `enable_thinking` mode for tougher, ambiguous cases

### 📄 Kaagaz — Document assistant
- Upload a photo of any government letter or notice
- `qwen-vl-max` returns a plain-language explanation, a **GOOD / CAUTION / ACTION-NEEDED verdict**, what to do next, any deadline/office, and a **tickable checklist** of required documents
- Optional **read-aloud** (Web Speech API) for non-readers

### 📋 Track — Complaint tracking
- A visual status timeline for every filed complaint
- Auto-advancing status (demo aliveness) + optional **cloud sync** across devices when signed in

### 🗣️ Multilingual — inclusion as the substrate, not a feature
- One global language selector (persisted to localStorage)
- The chosen language is injected into **every** API prompt — chat, complaints, scheme reasons, document explanations — so the experience is *natively* multilingual, not a translate button bolted on top

### 🤖 Bonus: Saathi Bot + polished UX
- A **Spline 3D floating robot** on the dashboard opens a quick-launch menu to jump between features
- **Optional Google sign-in** (Firebase) that *never blocks the app* — plus **Demo Mode** so judges enter in one click
- A custom animated **glowing showcase card**, smooth-black theme, and fully responsive, mobile-first design

---

## 🏗️ Architecture

```
                          ┌─────────────────────────────────────────┐
                          │              Browser (client)            │
                          │                                          │
  Language selector ──────┤  Landing → (Google / Demo) → Dashboard   │
  (injected into every    │     │                                    │
   prompt)                │     ├── Samasya  (camera + Leaflet map)   │
                          │     ├── Baat Karo (streaming chat)        │
                          │     ├── Yojana    (profile input)         │
                          │     ├── Kaagaz    (document upload)       │
                          │     └── Track     (localStorage/Firestore)│
                          └───────────────┬──────────────────────────┘
                                          │  fetch (image/text + language)
                          ┌───────────────▼──────────────────────────┐
                          │       Next.js API Routes (serverless)     │
                          │   /api/chat    → streaming text           │
                          │   /api/vision  → report + document modes  │
                          │   /api/match   → scheme matching          │
                          │                                           │
                          │   • server-side API key (never exposed)   │
                          │   • JSON normalization + guards           │
                          │   • authority grounding from seed data    │
                          └───────────────┬──────────────────────────┘
                                          │  OpenAI-compatible calls
                          ┌───────────────▼──────────────────────────┐
                          │   Alibaba Cloud DashScope (Qwen)          │
                          │   qwen3.7-max  (reasoning / text / JSON)  │
                          │   qwen-vl-max  (multimodal vision)        │
                          └───────────────────────────────────────────┘
```

**Data flow for a typical action:** client resizes/encodes input → POSTs to a Next.js API route (with the chosen language) → route builds a strict prompt and calls Qwen → response is parsed, **normalized, and guarded** → clean typed JSON returned to the UI. The API key lives only on the server; there is **no database** — persistent state is localStorage with optional best-effort Firestore sync.

---

## 🧠 The AI Layer (DashScope Qwen)

Smart Bharat runs entirely on **Alibaba Cloud's Qwen models** via the **DashScope OpenAI-compatible API** — accessed through the standard `openai` SDK pointed at DashScope's endpoint.

| Model | Role | Why |
|---|---|---|
| `qwen3.7-max-2026-05-20` | Chat, scheme matching, reasoning | Strong multilingual reasoning; a *thinking* model we toggle on/off per task |
| `qwen-vl-max` | Photo & document understanding | Multimodal vision → structured JSON |

**Three reusable helpers** (`lib/qwen.ts`) power every feature:
- `qwenJSON()` — text → strict JSON, with an optional `think` flag (`enable_thinking`)
- `qwenVisionJSON()` — base64 image + prompt → strict JSON
- A streaming helper for chat

**Key DashScope-specific engineering:**
- **Structured output via `response_format: { type: "json_object" }`** — DashScope supports `json_object` *only* (not `json_schema`), so the exact shape is described **in the prompt** and parsed with a guarded `try/catch`. Routes **never 500** on a model hiccup — they return an honest `502` instead of masking failure.
- **Thinking control** — `qwen3.7-max` emits reasoning tokens by default; we set `enable_thinking: false` for snappy demos and expose it as an opt-in toggle only where deep reasoning helps (Yojana).
- **Lazy client init** — the Qwen client is created lazily so `next build` never crashes on a missing key.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS (custom saffron/india-green/ink theme, smooth-black) |
| **AI** | Alibaba Cloud **Qwen** (DashScope) via the OpenAI-compatible API |
| **Vision** | `qwen-vl-max` multimodal model |
| **Maps** | Leaflet + OpenStreetMap + Nominatim reverse geocoding |
| **Auth** | Firebase Authentication (Google) — optional, non-blocking |
| **Storage** | localStorage + optional Firestore sync |
| **3D** | Spline (`@splinetool/react-spline`) |
| **Icons** | lucide-react |
| **Deployment** | Vercel (serverless functions + edge network) |

---

## 📁 Project Structure

```
smart-bharat/
├── app/
│   ├── page.tsx              # Landing (Google / Demo entry)
│   ├── dashboard/            # Feature hub + Saathi 3D bot
│   ├── chat/                 # 💬 Baat Karo
│   ├── report/               # 📸 Samasya (camera + map)
│   ├── schemes/              # 🎯 Yojana
│   ├── documents/            # 📄 Kaagaz
│   ├── track/                # 📋 Track
│   └── api/
│       ├── chat/route.ts     # streaming Qwen chat
│       ├── vision/route.ts   # qwen-vl-max: report + document modes
│       └── match/route.ts    # scheme matching (+ thinking toggle)
├── components/
│   ├── nav.tsx               # nav + language selector + auth
│   ├── location-picker.tsx   # Leaflet map + geolocation + geocoding
│   ├── saathi-bot.tsx        # Spline 3D floating assistant
│   ├── glowing-shadow.tsx    # animated showcase card
│   └── auth-button.tsx       # Google / demo / sign-out
├── lib/
│   ├── qwen.ts               # DashScope client + JSON/vision/stream helpers
│   ├── i18n.tsx              # language context (the multilingual substrate)
│   ├── auth.tsx              # Firebase auth + demo mode
│   ├── store.ts              # complaint persistence (localStorage)
│   ├── sync.ts               # optional Firestore sync
│   └── types.ts              # shared domain types
├── data/
│   ├── schemes.json          # curated welfare-scheme catalogue
│   └── departments.json      # per-city authority routing
└── public/sample-pothole.jpg # demo-insurance sample image
```

---

## 💻 Running Locally

```bash
# 1. Clone & install
git clone https://github.com/ArpitKumar8649/Devengers_Promptswar.git
cd Devengers_Promptswar
npm install

# 2. Configure environment
cp .env.example .env.local
#   then add your DashScope key (see below)

# 3. Run
npm run dev            # → http://localhost:3000
```

### Environment variables

```bash
# Required — Alibaba Cloud DashScope (get a key at modelstudio.console.alibabacloud.com)
DASHSCOPE_API_KEY=sk-...
DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen3.7-max-2026-05-20
QWEN_VL_MODEL=qwen-vl-max

# Optional — Firebase Google auth (leave blank to run in demo-only mode)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> The app runs fully without Firebase — sign-in simply hides and Demo Mode carries the experience.

---

## ✍️ Prompt Engineering Strategy

Every AI feature is a deliberately engineered prompt, not a raw chat call:

1. **Strong personas** — each route casts Saathi in a role (a *municipal grievance officer* for Samasya; a *calm village helper who never fabricates* for Kaagaz; a *welfare-scheme expert* for Yojana).
2. **Shape-in-prompt JSON** — because DashScope supports `json_object` only, the exact output schema is described in the prompt, giving reliable, parseable structure without `json_schema`.
3. **Anti-hallucination guardrails** — models are instructed never to invent scheme names, amounts, deadlines, or documents not present in the source data or image.
4. **Language as a parameter** — the target language is injected into every prompt, so a single route serves all six languages.
5. **Grounding over trust** — department/authority names come from curated seed data; the model's routing decision is validated against it.

*(A full breakdown lives in [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md).)*

---

## ⚙️ Engineering Decisions That Matter

- **Never breaks on stage** — every AI route normalizes and guards its output; malformed model JSON can't crash a page, and failures surface as honest errors, not silent junk.
- **Deploy-safe by construction** — lazy client init keeps `next build` green even without keys; the app was deployed in the first hour and re-verified live.
- **Server-side secrets** — the DashScope key never reaches the browser; all model calls go through API routes.
- **Progressive enhancement** — Firebase, geolocation, and read-aloud are all optional and degrade gracefully. The core civic loop works for everyone, everywhere.
- **Demo insurance** — a bundled sample photo means the flagship feature demos flawlessly even without a camera or good lighting.

---

## 🌍 Real-World Impact

Smart Bharat directly advances the challenge's mission — **transparency, accessibility, and digital inclusion**:

- **Accessibility** — a photo and a voice replace forms and fluent English
- **Inclusion** — natively multilingual across six languages, designed for low-literacy users with large icons and minimal text
- **Transparency** — complaints are classified, routed, and tracked; entitlements are surfaced, not hidden
- **Dignity** — citizens discover and claim what they're owed, in the language they think in

> Transparency and dignity shouldn't require a degree, English, or a data plan.

---

## 🗺️ Roadmap

- Real government-portal integrations (CPGRAMS, state grievance systems) for genuine complaint filing
- Voice-first input (speech-to-text) for the fully non-literate
- Live scheme-data grounding against official sources
- PDF document support in Kaagaz
- Offline-first PWA for low-connectivity regions

---

<div align="center">

### 🇮🇳 Built with purpose for a Smarter Bharat.

**One companion. Six civic superpowers. Six languages. Powered by Qwen.**

[🚀 Try it live](https://devengers-promptswar.vercel.app) · [💻 Source](https://github.com/ArpitKumar8649/Devengers_Promptswar)

*DEVENGERS PromptWars 2026 × Global Prompt Challenge · Hack2Skill × Google for Developers*

**Build. Learn. Lead. Impact.** 💛🖤

</div>
