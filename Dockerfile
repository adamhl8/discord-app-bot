FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json .
COPY bun.lock .
RUN bun i
COPY . .
RUN bun run build

FROM oven/bun:latest

LABEL org.opencontainers.image.source=https://github.com/adamlh8/discord-app-bot
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package.json .
COPY --from=build /app/bun.lock .
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

RUN apt update && apt install openssl -y

RUN bun install -p -f

ENTRYPOINT [ "bun", "start:prod" ]
