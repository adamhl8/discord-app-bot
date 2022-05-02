FROM node:latest

ENV BOT_TOKEN=
ENV CLIENT_ID=970624591607246869
ENV GUILD_ID=756149995820023818

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD node --loader ts-node/esm ./src/index.ts
