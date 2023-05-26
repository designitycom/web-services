FROM node:18.7.0
WORKDIR /web-services 
COPY package.json .
RUN npm install
COPY . .
EXPOSE 6000
CMD [ "npm", "run", "dev" ]
