# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install -g bun && bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- Production ----
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup --system --gid 1001 litle && adduser --system --uid 1001 litle
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
USER litle
CMD ["node", ".output/server/index.mjs"]
