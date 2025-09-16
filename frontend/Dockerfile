# # Multi-stage build для лучшей оптимизации
# FROM node:18-alpine AS builder

# WORKDIR /app

# # Копируем package files
# COPY package.json package-lock.json* ./
# RUN npm ci --only=production

# # Копируем исходный код и собираем
# COPY . .
# RUN npm run build

# # Финальный образ
# FROM node:18-alpine AS production

# WORKDIR /app

# # Устанавливаем serve
# RUN npm install -g serve

# # Копируем собранное приложение
# COPY --from=builder /app/dist ./dist

# # Создаем non-root пользователя
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001

# # Меняем владельца файлов
# RUN chown -R nextjs:nodejs /app
# USER nextjs

# EXPOSE 3000

# CMD ["serve", "dist", "-s", "-l", "3000"]
# This Dockerfile uses `serve` npm package to serve the static files with node process.
# You can find the Dockerfile for nginx in the following link:
# https://github.com/refinedev/dockerfiles/blob/main/vite/Dockerfile.nginx
FROM refinedev/node:18 AS base

FROM base as deps

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base as builder

ENV NODE_ENV production

COPY --from=deps /app/refine/node_modules ./node_modules

COPY . .

RUN npm run build

FROM base as runner

ENV NODE_ENV production

RUN npm install -g serve

COPY --from=builder /app/refine/dist ./

USER refine

CMD ["serve", "dist", "-s", "-l", "3000"]