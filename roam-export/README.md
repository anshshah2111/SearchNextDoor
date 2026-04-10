# Roam — Walk with Echo

A voice-first walking companion. Open the app, tap one button, and Echo (the glowing blob + warm voice) walks with you. Your city slowly uncovers as a living heat map of every walk you've taken together.

## What's in this folder

### The landing page
- `src/app/page.tsx` — main landing page (hero, "how it works", "Sound familiar?" ICP section, features, CTA)

### The demo / try it free flow
- `src/app/demo/page.tsx` — interactive demo page (the "Try it free" experience)
- `src/app/app/page.tsx` — onboarding entry
- `src/app/home/page.tsx` — home screen with fog map + "Let's go" button
- `src/app/walk/page.tsx` — active walk screen with live GPS + Echo
- `src/app/summary/page.tsx` — post-walk summary

### Components
- `src/components/EchoBlob.tsx` — animated SVG companion (idle/speaking/listening)
- `src/components/FogMap.tsx` — MapLibre GL map with fog reveal + heat gradient
- `src/components/VoiceController.tsx` — Web Speech API TTS + STT
- `src/components/OnboardingFlow.tsx` — 3-screen intro
- `src/components/SessionSummary.tsx` — stats + Echo closing message

### The brain
- `src/app/api/echo/route.ts` — Echo LLM API route (Ollama → Groq → Anthropic → fallback)
- `src/lib/echo-prompt.ts` — Echo's full personality system prompt
- `src/lib/echo-fallback.ts` — pre-scripted responses for offline mode

### Supporting files
- `src/lib/tiles.ts` — slippy map tile math
- `src/lib/storage.ts` — localStorage persistence
- `src/lib/geo.ts` — distance calculations
- `src/lib/anon-id.ts` — anonymous user ID
- `src/stores/walkStore.ts` — Zustand store for walk state
- `src/stores/userStore.ts` — Zustand store for user data
- `src/content/icp-jordan.md` — full ICP document (day-in-the-life, video ad script)

## Quick Start

```bash
# 1. Install
npm install

# 2. (Optional) Set up Echo's brain
cp .env.local.example .env.local
# Add GROQ_API_KEY=gsk_xxx (free at console.groq.com)
# Or skip — pre-scripted fallback works without any config

# 3. Run
npm run dev

# 4. Open http://localhost:3000 in Chrome
```

## Routes

- `/` — Landing page
- `/demo` — Interactive demo
- `/app` — Onboarding flow
- `/home` — Home screen with fog map
- `/walk` — Active walk with Echo
- `/summary` — Walk summary

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **MapLibre GL JS** + CartoDB dark tiles (free, no API token)
- **Zustand** — state management
- **Framer Motion** — animations
- **Web Speech API** — TTS + STT (Chrome/Safari)
- **Tailwind CSS v4** — styling
- **localStorage** — persistence (no backend)

## Echo LLM Cascade

Auto-tries in this order:
1. **Ollama** (local, free) — if running on localhost:11434
2. **Groq** (free cloud) — if `GROQ_API_KEY` is set
3. **Anthropic** (paid) — if `ANTHROPIC_API_KEY` is set
4. **Pre-scripted fallback** — always works
