FROM node:18.16.0
WORKDIR /src/
COPY package*.json ./
RUN npm install
copy . .
EXPOSE 3000
CMD [ "node", "app.js"]