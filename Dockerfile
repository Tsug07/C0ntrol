# ===========================================
# DOCKERFILE - C0NTROL
# Multi-stage build para Next.js com PostgreSQL
# ===========================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules
# Copiar arquivos de configuração primeiro
COPY package.json tsconfig.json next.config.js ./
COPY postcss.config.js tailwind.config.js ./
# Copiar código fonte
COPY src ./src

# Definir variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build da aplicação
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do build
# Primeiro copiar o standalone (já contém a estrutura básica)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Depois copiar os arquivos estáticos por cima
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Definir usuário
USER nextjs

# Expor porta
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Comando para iniciar
CMD ["node", "server.js"]
