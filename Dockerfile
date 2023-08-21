FROM node:slim

LABEL org.opencontainers.image.source https://github.com/adamlh8/discord-app-bot

ENV APPLICATION_ID=
ENV BOT_TOKEN=

WORKDIR /app

COPY . .
RUN npm i --omit=dev

ENTRYPOINT [ "node", "--enable-source-maps", "./dist/index.js"]
