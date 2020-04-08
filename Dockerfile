FROM node:lts
LABEL maintainer avatar<evl.avatar@gmail.com>

WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

EXPOSE 4000
CMD [ "npm", "start" ]
