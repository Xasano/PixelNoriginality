FROM oven/bun:1.2-alpine AS builder
COPY . /app
WORKDIR /app
RUN bun install
RUN bun run build

FROM oven/bun:1.2-alpine AS runner
COPY --from=builder /app/dist /app
WORKDIR /app
CMD exec ./pixelwebsocket