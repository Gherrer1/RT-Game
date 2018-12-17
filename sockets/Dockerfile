FROM node:10.14.1-jessie-slim

RUN npm init -y && npm install -g nodemon && npm install --save socket.io randomcolor

WORKDIR /app

EXPOSE 8000

COPY socketSetup.js socketSetup.js
COPY server.js server.js
COPY Player.js Player.js
COPY socketEventNames.js socketEventNames.js

CMD ["nodemon", "server.js"]