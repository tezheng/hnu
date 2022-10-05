FROM node:16-slim

WORKDIR /app
COPY package.json package.json
COPY tsconfig.json tsconfig.json
RUN yarn install && rm -rf /usr/local/share/.cache
