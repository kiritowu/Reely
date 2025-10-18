# 🎬 Reely

> **Breaking down information silos, one source at a time.**

Reely transforms any web source into engaging video reels and text summaries - from indie blogs in Japanese to local news sites in any language. Built to democratize access to global information beyond mainstream media.

[![Cursor Hackathon Singapore 2025](https://img.shields.io/badge/Cursor%20Hackathon-Singapore%202025-6C5CE7?style=for-the-badge)](https://luma.com/cursor-hack-sg)

## 🌍 The Problem

In today's world, we're drowning in fragmented, polarized, and language-siloed information. Breakthrough AI developments in Chinese media, alternative perspectives outside dominant narratives, and niche expert insights - all get lost in translation.

**Existing platforms** like Flipboard or Ground News only work with predefined sources or RSS feeds. **The result?** You get the same mainstream content everyone else does.

## ✨ Our Solution

**Reely** gives you **truly customizable content feeds** with:

- 🔗 **Any Source, Any Language** - From a founder's blog to a local news site, or even someone's X feed
- 🤖 **AI-Powered Extraction** - No RSS feed? No problem. Our agents crawl, extract, and understand any website
- 🎥 **Engaging Formats** - Get AI-generated video summaries powered by SORA or swipeable text summaries
- 🌐 **Cross-Language Intelligence** - Track content in languages you don't even speak
- 📊 **Real-World Applications** - Monitor SEC filings, follow thought leaders, or aggregate niche industry news

## 🚀 Tech Stack

### Backend (Python)
- **🧠 Pydantic AI** - Multi-agent orchestration
- **⚡ Gemini 2.5 Flash** - Fast, multilingual summarization
- **🌐 Browser-Use** - Real web interaction and dynamic content extraction
- **🎬 OpenAI SORA** - AI-powered video generation
- **🎤 ElevenLabs** - Text-to-speech for video voiceovers
- **⚙️ FastAPI** - High-performance API backend

### Frontend (TypeScript)
- **⚛️ Next.js 15** - React framework with App Router
- **🗄️ Supabase** - Authentication & database (PostgreSQL + Drizzle ORM)
- **🎨 Tailwind CSS** + **Radix UI** - Modern, accessible UI components
- **🔄 TanStack Query** - Powerful data fetching and caching

## 🎯 Key Features

### 1. **Flexible Source Management**
Add any website URL - our AI agents handle the rest. No API required, no RSS needed.

### 2. **Intelligent Content Extraction**
Using browser automation and vision models, we extract articles even from JavaScript-heavy sites and complex layouts.

### 3. **Multi-Format Output**
- **Video Reels**: SORA-generated videos with ElevenLabs voiceovers
- **Text Summaries**: Swipeable, structured summaries with source links
- **Mobile-First**: TikTok/Instagram Reels-style interface

### 4. **Cross-Language Support**
Track content in any language - summaries are generated in your preferred language.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                  │
│  • User authentication (Supabase Auth)                  │
│  • Source management UI                                 │
│  • Video feed with infinite scroll                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ REST API
                    │
┌───────────────────▼─────────────────────────────────────┐
│                  Backend (FastAPI)                      │
│  • /latest - Extract & summarize latest articles        │
│  • /summarize - Summarize specific URL                  │
│  • /sora - Generate video from summaries                │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴──────────┬────────────┐
        │                      │            │
┌───────▼──────┐   ┌───────────▼─────┐   ┌──▼──────────┐
│ Browser-Use  │   │  Gemini Flash   │   │    SORA     │
│   Agent      │   │  Summarization  │   │    Video    │
│              │   │                 │   │  Generation │
└──────────────┘   └─────────────────┘   └─────────────┘
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- **pnpm** (frontend package manager)
- **uv** (Python package manager)

### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Set up environment variables
cp .env.example .env
# Add your API keys:
# - GOOGLE_API_KEY (Gemini)
# - ANTHROPIC_API_KEY (Claude)
# - OPENAI_API_KEY (SORA)
# - ELEVENLABS_API_KEY

# Run the server
uv run python server.py
```

The backend will start at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

The frontend will start at `http://localhost:3000`

## 📝 Tested Sources

We've successfully tested Reely with diverse sources:

- 🧠 **AI Research**: DeepLearning.AI, Andrej Karpathy's blog
- 🚀 **Tech News**: Hacker News, TechCrunch
- 🌏 **International**: CNBC World, 36Kr (China), CSDN (Chinese dev community)
- 👤 **Personal Blogs**: Sam Altman, Chip Huyen
- 🐦 **Social Media**: X/Twitter profiles

## 🎥 API Usage

### Extract Latest Articles

```bash
GET http://localhost:8000/latest?url=https://blog.samaltman.com
```

Returns summaries + generates video reels automatically.

### Summarize Specific URL

```bash
GET http://localhost:8000/summarize?url=https://example.com/article
```

Returns text summary only.

## 👥 Team

Built with 💜 by:

- **Alex Chien** - [GitHub](https://github.com/Alexc09) | [LinkedIn](https://www.linkedin.com/in/alex-chien-09/)
- **Wong Zhao Wu (Bryan)** - [GitHub](https://github.com/kiritowu) | [LinkedIn](https://www.linkedin.com/in/zw-wong/)
- **Muhammad Faqih Akmal** - [GitHub](https://github.com/faqihxdev) | [LinkedIn](https://www.linkedin.com/in/faqih-akmal/)

## 🌟 Why Reely?

> "In a world where AI breakthroughs and geopolitical shifts happen daily, **speed and access are the new moats**."

Reely bridges the digital divide by making global information truly accessible, customizable, and fast - whether you're tracking SEC filings for investment decisions, following your favorite blogger, or staying updated on news in languages you don't speak.

**We're not just curating content - we're democratizing access to information.**

<div align="center">
  <p>Made with ❤️ at Cursor Hackathon Singapore 2025</p>
  <p>
    <a href="#-reely">Back to Top</a>
  </p>
</div>
