FROM node:8-jessie
RUN mkdir /app
WORKDIR /app
COPY package.json .
RUN npm install
RUN npm rebuild node-sass
COPY . .
CMD npm run start
