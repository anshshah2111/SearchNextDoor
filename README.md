# Roam — Walk with Echo

A voice-first walking companion for overworked adults who feel stuck inside. Open the app, tap one button, and **Echo** — a warm, glowing blob who is both the character on your screen and the voice in your ear — walks with you.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome (Web Speech API works best there).

## Optional: Anthropic API

To enable AI-powered Echo responses (instead of pre-scripted fallbacks), add your API key:

```bash
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key
```

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **MapLibre GL JS** — free, open-source map rendering with CartoDB dark tiles
- **Zustand** — state management
- **Framer Motion** — Echo blob animations
- **Web Speech API** — text-to-speech + speech recognition (Chrome/Safari)
- **Tailwind CSS v4** — styling
- **localStorage** — persistence (no backend needed for demo)

## Architecture

- `src/app/` — Next.js pages (onboarding → home → walk → summary)
- `src/components/` — FogMap, EchoBlob, VoiceController, OnboardingFlow
- `src/lib/` — tile math, storage, Echo system prompt
- `src/stores/` — Zustand stores for walk and user state
- `src/app/api/echo/` — API route proxying to Anthropic (with fallback)
