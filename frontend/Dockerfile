FROM node:20.18.0-bookworm-slim

WORKDIR /web

COPY package*.json /web/
RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 8080
