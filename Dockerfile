FROM oven/bun:canary
LABEL org.opencontainers.image.source=https://github.com/adamhl8/discord-app-bot
WORKDIR /app
ENV NODE_ENV="production"

COPY package.json bun.lock bunfig.toml ./

RUN bun install --ignore-scripts --production

COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts ./
COPY tsconfig.json ./

CMD ["sh", "-c", "bun prisma migrate deploy && exec bun ./src/index.ts"]
