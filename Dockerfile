FROM node:latest

ENV BOT_TOKEN=
ENV CLIENT_ID=
ENV GUILD_ID=

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD node --loader ts-node/esm ./src/index.ts
