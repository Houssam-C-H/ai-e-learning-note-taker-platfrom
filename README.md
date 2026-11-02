# 🎓 NoteAI — Intelligent E-Learning & Lecture Note-Taker Platform

[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-LPU_Inference-f97316?style=flat-square)](https://groq.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash_&_Pro-4285F4?style=flat-square&logo=google)](https://aistudio.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai)](https://openai.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.11-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

> **NoteAI** is an enterprise-grade AI lecture intelligence platform that converts lengthy online university recordings (BigBlueButton, MP4, WebM) into structured, high-yield study dossiers, Anki-style spaced repetition flashcards, and interactive self-test quizzes in seconds.

---

## 🌟 Key Highlights & Capabilities

### ⚡ Multi-Provider LLM Synthesis Engine
Switch seamlessly between top AI synthesis providers right from the dashboard or settings:
* **Groq Cloud LPUs (Ultra-Fast 0.3s)**: Run flagship open-weights models (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`) with sub-second generation speeds.
* **Google Gemini (100% Free, 1M Context)**: Leverage `gemini-2.5-flash` and `gemini-2.5-pro` with Google AI Studio's generous free tier (no credit card required).
* **OpenAI (Flagship Multimodal)**: Support for `gpt-4o` and `gpt-4o-mini` with strict token optimization.
* **Transparent Diagnostic Hub**: Test API keys in real time with automatic model sanitization and descriptive troubleshooting feedback.

### 🎙️ BigBlueButton (BBB) Direct Ingestion
* **Smart URL Parsing**: Paste full university recording URLs (e.g., `https://visioconference.supmti.ac.ma/playback/presentation/2.3/...`), which automatically extracts meeting hashes and server origins.
* **2h+ Long Lecture Support**: Handles standard 1h, 1.5h, 2h, and 3h+ marathon lectures with chunked transcript processing.
* **Synchronized Timestamp HUD**: Every section of generated notes includes clickable timestamps (e.g. `[14:32]`). Clicking jumps the embedded lecture video/audio player to the exact second.
* **On-the-Fly Course Registry**: Create and color-code new academic courses right during link insertion without leaving the ingest workflow.

### 📚 Adaptive Study Tools
* **Structured Markdown & KaTeX Notes**: Hierarchical outlines, executive summaries, definitions, code blocks, and mathematical formulas rendered beautifully.
* **Anki SM-2 Spaced Repetition**: Flashcards featuring front/back reveals, difficulty grading (`Again`, `Hard`, `Good`, `Easy`), and optimal recall intervals.
* **Interactive Examination Engine**: Multiple-choice quizzes with instant grading, question-by-question explanations, and score tracking.

### 👥 Enterprise Role-Based Access Control (RBAC)
* **Student Mode**: Personalized course overview, study guides, flashcard decks, and quiz practice.
* **Professor Mode**: Lecture upload management, student cohort analytics, and curriculum curation.
* **Administrator Mode**: System health diagnostics, global API key configuration, and server logs.

---

## 🏗️ Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │             CLIENT BROWSER              │
                      │  Next.js 14 App Router · Tailwind CSS  │
                      └────────────────────┬────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
                    ▼                                             ▼
     ┌─────────────────────────────┐               ┌─────────────────────────────┐
     │   Next.js API Gateway       │               │      FastAPI Backend        │
     │   • BigBlueButton Ingestion │               │   • PostgreSQL 16 + pgvector│
     │   • Same-Origin Video Proxy │               │   • Redis / Celery Workers  │
     │   • Session State Fallback  │               │   • Faster-Whisper (STT)    │
     │   • Diagnostic AI Tester    │               │   • MinIO S3 Object Storage │
     └──────────────┬──────────────┘               └─────────────────────────────┘
                    │
                    ▼
     ┌────────────────────────────────────────────────────────────┐
     │              Multi-Provider AI Synthesis Hub               │
     ├────────────────────────┬───────────────────┬───────────────┤
     │  Groq Cloud LPUs       │   Google Gemini   │  OpenAI API   │
     │  • GPT-OSS 120B (0.3s) │   • 2.5 Flash     │  • GPT-4o     │
     │  • GPT-OSS 20B         │   • 2.5 Pro       │  • 4o-mini    │
     │  • Qwen 3.8 27B        │   • 1M Context    │               │
     └────────────────────────┴───────────────────┴───────────────┘
```

---

## 🚀 Quick Start (Standalone Next.js Mode)

You can run NoteAI instantly without Docker or local database setups using the self-contained Next.js engine:

### 1. Clone the Repository
```bash
git clone https://github.com/Houssam-C-H/ai-e-learning-note-taker-platfrom.git
cd ai-e-learning-note-taker-platfrom
```

### 2. Configure Environment Variables
Copy the template file to `.env.local` inside the `frontend` folder:
```bash
cp frontend/.env.local.example frontend/.env.local
```

Open `frontend/.env.local` and add your preferred AI key:
```env
# Choose: "groq" (Fastest), "gemini" (100% Free), or "openai"
AI_PROVIDER=groq

# Free Groq key from https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_key_here

# Free Gemini key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_key_here

# Optional: University BigBlueButton base URL
BBB_BASE_URL=https://visioconference.supmti.ac.ma
```

### 3. Install Dependencies & Launch
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🐳 Full Microservice Setup (Docker & FastAPI)

For production deployments requiring local Whisper speech-to-text, PostgreSQL with `pgvector`, Redis Celery workers, and MinIO storage:

```bash
# 1. Start all containers (Postgres, Redis, MinIO, FastAPI backend, Next.js frontend)
docker-compose up -d --build

# 2. Apply database migrations
docker-compose exec backend alembic upgrade head

# 3. Access Services
# • Frontend:       http://localhost:3000
# • FastAPI Docs:   http://localhost:8000/docs
# • MinIO Console:  http://localhost:9001 (minioadmin / minioadmin)
```

---

## 🔑 AI Provider Setup & Free Keys

| Provider | Model Recommendations | Cost | Where to get key |
|---|---|---|---|
| **Groq Cloud** | `openai/gpt-oss-120b`<br>`openai/gpt-oss-20b`<br>`qwen/qwen3.8-27b` | Free Tier (High RPM) | [Groq API Keys](https://console.groq.com/keys) |
| **Google Gemini** | `gemini-2.5-flash`<br>`gemini-2.5-pro` | 100% Free (No credit card needed) | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| **OpenAI** | `gpt-4o-mini`<br>`gpt-4o` | Pay-as-you-go (Requires balance) | [OpenAI API Keys](https://platform.openai.com/api-keys) |

> 💡 **Tip:** You can enter your API keys either in `frontend/.env.local` or directly in the browser via the **Settings** page (`/settings`). Keys saved in Settings are preserved in your browser's encrypted local storage.

---

## 📁 Repository Structure

```
ai-e-learning-note-taker-platfrom/
├── frontend/                     # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── dashboard/        # University lecture ingest & course overview
│   │   │   ├── session/[id]/     # Study notes, synchronized HUD, flashcards & quiz
│   │   │   ├── profile/          # Academic profile & learner progress
│   │   │   ├── settings/         # AI provider config & live diagnostic ping
│   │   │   └── api/              # Ingest, video proxy, BBB scraper, and AI routes
│   │   ├── components/           # UI components (IngestForm, HUD, Flashcards, Quiz)
│   │   ├── context/              # Role-Based Access Control (RBAC) context
│   │   └── lib/                  # AI provider integrations (Groq, Gemini, OpenAI)
│   ├── public/                   # Static assets
│   ├── .env.local.example        # Frontend environment template
│   └── package.json
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py               # Application entrypoint & CORS config
│   │   ├── models/               # SQLAlchemy 2.0 ORM models
│   │   ├── routers/              # Courses, Sessions, Notes, Search, Quiz routers
│   │   ├── services/             # Audio extractors, Whisper STT, AI generators
│   │   └── tasks/                # Celery worker queues for asynchronous ingest
│   ├── alembic/                  # Database migration revisions
│   ├── requirements.txt
│   └── .env.example              # Backend environment template
│
├── docker-compose.yml            # Multi-service container orchestration
└── README.md                     # Documentation
```

---

## 🛡️ Security & Privacy Notice

* **Zero Hardcoded Secrets**: This repository does not contain any hardcoded API keys or credentials. All keys must be configured via environment files (`.env.local`) or user settings.
* **Protected Git Tracking**: `.env` and `.env.local` files are strictly excluded via `.gitignore`.
* **Same-Origin Proxying**: External video streams (including university BigBlueButton servers) are proxied securely to prevent CORS issues without leaking session tokens.

---

## 🤝 Contributing

Contributions, bug reports, and feature proposals are welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
