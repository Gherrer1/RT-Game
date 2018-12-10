FROM node

WORKDIR /app

RUN npm init -y && npm install -g nodemon && npm install --save socket.io

EXPOSE 8000

COPY socketServer.js socketServer.js

CMD ["nodemon", "socketServer.js"]