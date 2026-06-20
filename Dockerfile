FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts/install-githooks.mjs ./scripts/install-githooks.mjs
# Coolify may inject NODE_ENV=production at build time; devDependencies are required for tsc/vite.
ENV NODE_ENV=development
RUN npm ci --include=dev

COPY . .

# ---------------------------------------------------------------------------
# Public frontend build args ONLY — safe to embed in image layers.
# Coolify: "Available at Buildtime" = ON for VITE_* public vars below only.
# NEVER pass runtime secrets as Docker build ARG/ENV (they appear in image history):
#   SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, PAYSTACK_SECRET_KEY, RESEND_API_KEY,
#   SENDCHAMP_*, FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_PRIVATE_KEY, CRON_SECRET,
#   ADMIN_ACTION_PIN, COMMAND_CENTER_PIN
# ---------------------------------------------------------------------------
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_PUBLIC_APP_URL=https://bamsignal.com
ARG VITE_SUPPORT_EMAIL=support@bamsignal.com
ARG VITE_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG VITE_ENABLE_IMAGE_MODERATION=true

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL \
    VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL \
    VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY \
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY \
    VITE_ENABLE_IMAGE_MODERATION=$VITE_ENABLE_IMAGE_MODERATION

RUN npm run build
RUN npm run test:source-integrity
RUN test -f dist/index.html

FROM node:20-slim AS runner

WORKDIR /app

# Runtime secrets are injected by Coolify at container start (process.env), not at build.
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package.json package-lock.json ./
COPY scripts/install-githooks.mjs ./scripts/install-githooks.mjs
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY server ./server
COPY api ./api
COPY public ./public
COPY shared ./shared
COPY scripts ./scripts
# Import smoke test — must pass without runtime secrets (dry-run DB, optional services).
RUN node scripts/smoke-server-import.mjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/production.js"]
