# PulsePay

> Payments at the speed of a heartbeat. No wallet. No gas. No chain.

Peer-to-peer stablecoin payments via email, built for the UXmaxx Hackathon (Encode Club) — targeting the **Universal Accounts Track**, **Arbitrum Bounty**, **Magic Bonus**, and **ZeroDev Subtrack**.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Magic SDK** — embedded wallets, email/social login
- **Particle Network Universal Accounts (EIP-7702)** — unified cross-chain balance + routing
- **ZeroDev** — account abstraction, gas sponsorship
- **Arbitrum One** — primary settlement chain
- **Circle USDC** — transfer currency

## Getting started

```bash
npm install
cp .env.local.example .env.local
# fill in your API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Screen router (login/dashboard/send/confirm)
│   ├── layout.tsx            # Root layout + PWA metadata
│   ├── globals.css           # Full design system
│   └── api/
│       ├── balance/          # GET unified balance via Particle UA
│       ├── send/             # POST cross-chain payment
│       └── resolve-recipient/# POST email → wallet address
├── components/
│   ├── screens/              # LoginScreen, DashboardScreen, SendScreen, ConfirmScreen
│   └── ui/                   # PulseLogo, Toast
├── context/
│   └── AppContext.tsx        # Global state (user, balance, transactions, navigation)
├── hooks/
│   ├── useEKG.ts              # Animated heartbeat canvas
│   └── useToast.ts
├── lib/
│   ├── magic.ts               # Magic SDK wrapper
│   ├── particle.ts            # Universal Accounts SDK wrapper (EIP-7702)
│   ├── zerodev.ts             # ZeroDev AA client wrapper
│   └── mockData.ts            # Demo contacts/transactions
└── types/
    └── index.ts                # Shared TypeScript types
```

## Wiring up real SDKs

Every integration file (`lib/magic.ts`, `lib/particle.ts`, `lib/zerodev.ts`) currently runs on **mock data** so the app is fully demoable without API keys. Each file has the real SDK calls written out in comments directly above the mock fallback — uncomment and wire in your keys from `.env.local` when ready.

1. **Magic** — `lib/magic.ts` → `loginWithEmail()`, `loginWithGoogle()`
2. **Particle UA** — `lib/particle.ts` → `upgradeToUniversalAccount()`, `sendViaUniversalAccount()`
3. **ZeroDev** — `lib/zerodev.ts` → `getZeroDevClient()`, `sendGasless()`

## Mobile / PWA

The app is mobile-first and installable as a PWA (`public/manifest.json`). On iOS Safari or Android Chrome: **Share → Add to Home Screen**. Add real icon files at `public/icon-192.png` and `public/icon-512.png` before demo day.

## Design system

Dark-first UI. Single accent color (`--red: #C1121F`) used only for the logo, primary CTA, and the send-confirmation pulse animation. All tokens live in `src/app/globals.css`.

## Brand

The name comes from the rhythm of a heartbeat — payments that move constantly, invisibly, and instantly, the same way a pulse does. The signature moment is the send confirmation: a pulse ring expands, a checkmark lands, an EKG line draws itself, and the only copy on screen is **"Sent."**
