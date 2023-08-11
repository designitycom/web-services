FROM node:18.7.0 as depinstall
WORKDIR /web-services 
COPY package.json .
COPY package-lock.json .
RUN npm install

FROM node:18:7.0
WORKDIR /web-services 
COPY --from=depinstall COPY /web-services/node_modules /web-services/
COPY --from=depinstall COPY /web-services/package.json /web-services/
COPY --from=depinstall COPY /web-services/package-lock.json /web-services/
COPY src .
COPY nodemon.json .
COPY tsconfig.json .
COPY Anchor.toml .
COPY target .
RUN npm run build
EXPOSE 5000
CMD [ "npm", "run", "dev" ]
