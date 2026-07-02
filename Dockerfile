FROM oven/bun:latest AS base
LABEL org.opencontainers.image.source=https://github.com/adamlh8/discord-app-bot
WORKDIR /app
ENV NODE_ENV="production"

RUN apt update && apt install openssl -y

FROM base AS install

RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install

FROM base

COPY --from=install /temp/prod/node_modules ./node_modules
COPY prisma ./prisma
COPY src ./src
COPY package.json ./
COPY prisma.config.ts ./
COPY tsconfig.json ./

ARG DATABASE_URL="file:db/prod.db"
ENV DATABASE_URL=${DATABASE_URL}

# --bun replaces the removed bunfig.toml [run] bun = true (prisma's node-shebang bins run under bun)
RUN bun --bun db:generate

CMD ["bun", "--bun", "start:prod"]
