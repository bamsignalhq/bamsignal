FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
# Coolify may inject NODE_ENV=production at build time; devDependencies are required for tsc/vite.
ENV NODE_ENV=development
RUN npm ci --include=dev

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_PUBLIC_APP_URL=https://bamsignal.com
ARG VITE_SUPPORT_EMAIL=support@bamsignal.com
ARG VITE_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG VITE_ENABLE_IMAGE_MODERATION=true

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_PUBLIC_APP_URL=$VITE_PUBLIC_APP_URL
ENV VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL
ENV VITE_PAYSTACK_PUBLIC_KEY=$VITE_PAYSTACK_PUBLIC_KEY
ENV NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ENV VITE_ENABLE_IMAGE_MODERATION=$VITE_ENABLE_IMAGE_MODERATION

RUN npm run build
RUN test -f dist/index.html

FROM node:20-slim AS runner

WORKDIR /app

ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server
COPY api ./api
COPY public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/production.js"]
