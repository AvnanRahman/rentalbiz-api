FROM node:18.16.0
WORKDIR /
COPY package*.json ./
RUN npm install
copy . .
CMD [ "node", "/src/app.js"]
