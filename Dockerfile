FROM node:16.13.0

RUN npm install

EXPOSE 9000

CMD [ "npm", "start" ]
