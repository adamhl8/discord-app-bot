FROM oven/bun:latest AS base
LABEL org.opencontainers.image.source=https://github.com/adamlh8/discord-app-bot
WORKDIR /app
ENV NODE_ENV="production"

RUN apt update && apt install openssl -y

FROM base AS install

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile

FROM base

COPY --from=install /temp/prod/node_modules ./node_modules
COPY prisma ./prisma
COPY src ./src
COPY bunfig.toml ./
COPY package.json ./
COPY prisma.config.ts ./
COPY tsconfig.json ./

ARG DATABASE_URL="file:db/prod.db"
ENV DATABASE_URL=${DATABASE_URL}

RUN bun db:generate

CMD ["bun", "start:prod"]
