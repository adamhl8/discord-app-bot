FROM node:latest

ENV BOT_TOKEN=

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

COPY . .

CMD node --loader ts-node/esm ./src/index.ts
