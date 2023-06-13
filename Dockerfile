FROM node:18.7.0
WORKDIR /web-services 
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5000
CMD [ "npm", "run", "dev" ]
