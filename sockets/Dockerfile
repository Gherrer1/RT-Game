FROM node:10.14.1-jessie-slim

WORKDIR /app

EXPOSE ${PORT:-8000}

COPY package.json package.json

RUN npm install

COPY . .

CMD ["node_modules/.bin/nodemon", "server.js"]