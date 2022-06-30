FROM node:slim

LABEL org.opencontainers.image.source https://github.com/adamlh8/discord-app-bot

ENV BOT_TOKEN=
ENV CLIENT_ID=
ENV GUILD_ID=

WORKDIR /app

COPY . .
RUN npm install

CMD node --loader ts-node/esm ./src/index.ts
