FROM node:10.14.1-jessie-slim

WORKDIR /app

RUN npm init -y && npm install -g nodemon && npm install --save socket.io

EXPOSE 8000

COPY socketSetup.js socketSetup.js
COPY server.js server.js

CMD ["nodemon", "server.js"]