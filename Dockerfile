# specify the node base image with your desired version node:<version>
FROM node:12
# replace this with your application's default port
EXPOSE 8080
 
WORKDIR /app

COPY . .
 
RUN npm install
RUN npm run build
 
CMD [ "node", "server/server.js" ]
