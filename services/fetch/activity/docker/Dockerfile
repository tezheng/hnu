FROM node:16-alpine

WORKDIR /app
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY src src
COPY config config
COPY index.ts index.ts

RUN yarn install

CMD yarn start
