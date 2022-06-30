FROM node:latest

LABEL org.opencontainers.image.source https://github.com/adamlh8/discord-app-bot

ENV BOT_TOKEN=
ENV CLIENT_ID=
ENV GUILD_ID=

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD node --loader ts-node/esm ./src/index.ts
