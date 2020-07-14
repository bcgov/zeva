FROM node:8-jessie
RUN mkdir /app
WORKDIR /app
COPY . .
RUN rm package-lock.json && \
    npm install && \
    npm rebuild node-sass
CMD npm run production
