FROM oven/bun:latest AS base
LABEL org.opencontainers.image.source=https://github.com/adamlh8/discord-app-bot
WORKDIR /app
ENV NODE_ENV="production"
ENV BUN_OPTIONS="--bun"

RUN apt update && apt install openssl -y

FROM base AS install

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base

COPY --from=install /temp/prod/node_modules ./node_modules
COPY prisma ./prisma
COPY src ./src
COPY package.json ./
COPY tsconfig.json ./

RUN bun db:generate

CMD ["bun", "start:prod"]
