FROM node:18.16.0
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["/bin/bash", "-c", "node updateServiceAcc.js;node app.js"]
