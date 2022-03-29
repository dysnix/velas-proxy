FROM node:16.13.0

RUN mkdir velas-proxy

ADD . /velas-proxy
WORKDIR /velas-proxy
RUN cd /velas-proxy && rm -rf node_modules && rm -f package-lock.json && npm install

EXPOSE 9000

CMD [ "npm", "start" ]
