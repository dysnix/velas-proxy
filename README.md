# VELAS proxy server
This project is used to read and proxy requests.

## !!!This project is using google-application-credentials.json(service-account-file.json)!!!

This file is needed to connect project to Google Big Table.
To set up it for project you should add path to `google-application-credentials.json` to `.env` file in `GOOGLE_APPLICATION_CREDENTIALS` field.
In case file is located in project directory you can use `./google-application-credentials.json``(service-account-file.json)`. In case file is located somewhere outside
of project directory you should use full path to file

## All steps to run project on local

### Please define correct `USE_SSL` property in .env file. `use` or `no` supported. `no` by default
### Also `PERIOD` is need to define in .env file. 14 days by default

1) Add google-application-credentials.json

2) `npm install` to install all dependencies from package.json

3) `npm start` to run project. It will be available on [http://localhost:9000](http://localhost:9000)

After this you can call jsonrpc requests for eth_getBlock*(eth_getBlockByHash, eth_getBlockByNumber, eth_getBlockTransactionCountByHash, eth_getBlockTransactionCountByNumber), eth_getLogs, eth_getTxReceipt.
Also these methods available for websocket connections

For deployment process use Docker section from README.md

## Available Scripts

In the project directory, you can run:

### `npm install`

To install all dependencies.

### `npm start`

Open [http://localhost:9000](http://localhost:9000) to view it in the browser.

### `npm run test`

Run the test cases.

`/POST eth_getBlock save - should save request for eth_getBlock`

`/POST eth_getBlock proxy - should proxy request for eth_getBlock`

`/POST eth_getBlock reject - should return 400 for eth_getBlock`

`/POST eth_getLogs - should check logs in bigTable and on server`

## Run with docker

In the project directory, you need to run:

### `docker build ./`

Build an image

### `docker image ls`

To list all images

### `docker run IMAGE_ID`

With proper IMAGE_ID from list

### NOTE: for Docker build you need to set up google-application-credentials.json in project. See above

## IMPORTANT!!! To run server over https please define correct path to key.pem and cert.pem files in constants.js file in root folder of the project