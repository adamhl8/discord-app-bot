FROM ghcr.io/nubjs/nub:latest
LABEL org.opencontainers.image.source=https://github.com/adamhl8/discord-app-bot
WORKDIR /app
ENV NODE_ENV="production"

COPY package.json lock.yaml ./

RUN nub install --frozen-lockfile --ignore-scripts --prod

COPY prisma ./prisma
COPY src ./src
COPY prisma.config.ts ./
COPY tsconfig.json ./

CMD ["sh", "-c", "nub run db:deploy && exec nub ./src/index.ts"]
