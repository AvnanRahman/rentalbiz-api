FROM node:18.16.0
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "node", "app.js"]
