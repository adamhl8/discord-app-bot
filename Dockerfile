FROM node:slim AS builder

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY prisma ./prisma

RUN npm install -g pnpm
RUN pnpm install

COPY tsconfig.json .
COPY src ./src
RUN pnpm build

FROM node:slim

LABEL org.opencontainers.image.source https://github.com/adamlh8/discord-app-bot
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

RUN apt update && apt install openssl -y

RUN npm install -g pnpm
RUN pnpm install

ENTRYPOINT [ "pnpm", "start:prod" ]
