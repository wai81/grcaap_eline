# Multi-stage build для лучшей оптимизации
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Копируем исходный код и собираем
COPY . .
RUN npm run build

# Финальный образ
FROM node:18-alpine AS production

WORKDIR /app

# Устанавливаем serve
RUN npm install -g serve

# Копируем собранное приложение
COPY --from=builder /app/dist ./dist

# Создаем non-root пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["serve", "dist", "-s", "-l", "3000"]