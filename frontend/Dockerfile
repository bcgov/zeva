FROM node:20.18.1

WORKDIR /web

COPY package*.json /web/
RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 8080
