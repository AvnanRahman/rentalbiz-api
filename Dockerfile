FROM node:18.16.0
WORKDIR /
COPY package*.json ./
RUN npm install
RUN mkdir /src/uploads
COPY . .
EXPOSE 8080
CMD ["/bin/bash", "-c", "node updateServiceAcc.js;node app.js"]
