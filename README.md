# YERO

A calm, focused daily task workspace built with Next.js 16, Supabase, and a liquid glass design system.

---

## ✨ Features

- **🌅 Asia/Kolkata (IST) Smart Reminders**: Operates strictly on `Asia/Kolkata` boundaries. Delivers idempotent check-ins at 09:00, 12:00, 15:00, 18:00, and 21:00 IST with dynamic task counters and completion celebrations.
- **🔔 Web Push Notifications**: Multi-device push support using native service worker push APIs, VAPID signing, and automatic 410/404 subscription pruning.
- **📜 Dedicated Notifications Page**: Full chronological history of all sent reminders grouped by date with category filters and history management.
- **💎 Liquid Glass UI**: Refined, distraction-free aesthetic with frosted glass cards, borderless sliding category capsules, and fluid Framer Motion transitions with zero layout jitter.
- **📱 Production-Ready PWA**: Installable standalone application with offline support, service worker caching, and app manifest.
- **🔒 Enterprise Security**: Strict Row Level Security (RLS) policies, sliding-window rate limiting on sensitive routes, and hardened HTTP headers (CSP, HSTS, XFO, XCTO).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Frontend**: [React 19](https://react.dev/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Liquid Glass CSS
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, RLS, RPCs)
- **Push Engine**: [web-push](https://www.npmjs.com/package/web-push)

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/sarthaksaini041/YERO.git
cd YERO
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your configuration:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from Supabase Project Settings)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` (generate with `npx web-push generate-vapid-keys`)
- `CRON_SECRET` (generate with `openssl rand -hex 24`)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🧪 Testing & Verification

Run the automated test suites:

```bash
# Type check & lint
npx tsc --noEmit
npm run lint

# Automated test scripts
node scripts/test-notifications-page.mjs
node scripts/test-ist-timezone.mjs
node scripts/test-security-and-pwa.mjs
node scripts/test-reminders-e2e.mjs
node scripts/verify-app.mjs
```

---

## 📄 License

MIT License
