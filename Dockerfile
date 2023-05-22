FROM node:18.16.0
WORKDIR /src/
COPY package*.json ./
RUN npm install
copy . .
CMD [ "node", "app.js"]
