FROM node:latest AS base
LABEL org.opencontainers.image.source=https://github.com/adamhl8/discord-app-bot
WORKDIR /app
ENV NODE_ENV="production"

RUN npm install -g --ignore-scripts=false @nubjs/nub

FROM base

COPY package.json ./
COPY lock.yaml ./

RUN nub install --ignore-scripts --prod

COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts ./
COPY tsconfig.json ./

ARG DATABASE_URL="file:db/prod.db"
ENV DATABASE_URL=${DATABASE_URL}

CMD ["nub", "run", "start:prod"]
