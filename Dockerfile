FROM node:18.16.0
WORKDIR /src
COPY package*.json ./
RUN npm create-env
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "node", "app.js"]
