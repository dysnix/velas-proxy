FROM node:16.13.0

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

EXPOSE 9000

CMD [ "npm", "start" ]
