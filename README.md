# BamSignal

BamSignal is a React + Vite dating app for Nigeria — discover profiles, send signals, chat, and manage premium plans. The web app ships with optional Capacitor shells for Android/iOS.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## API server (contact, Paystack, identity)

```bash
npm run server
```

## Environment

Copy `.env.example` to `.env.local` and fill in Supabase, Paystack, and email keys before production deploy.

## Mobile (optional)

Capacitor projects live in `android/` and `ios/`. Sync after a web build:

```bash
npm run cap:sync
npm run android   # or npm run ios
```
