FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN bun run build

FROM oven/bun:1
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.ts .

EXPOSE 3000

CMD ["bun", "run", "server.ts"]
