FROM node:16.20.0

WORKDIR /web

COPY package*.json /web/
RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 8080
