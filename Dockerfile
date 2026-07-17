# syntax=docker/dockerfile:1.7
# Shoot SEO panel (Nuxt 4, Nitro node-server SSR).

# ── Build ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Runtime ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Nitro listens here; NUXT_API_BASE (in-cluster API URL) is injected at runtime.
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
