const bigTable = require('../utils/bigTableUtil')
const axios = require("axios");
const {proxyWebsocket} = require('../utils/proxy')

async function eth_getBlock (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) {
            await bigTable.saveBlock(body.params);
            connection.sendUTF('Request saved!');
        }
        else
            await proxyWebsocket(request, socket, head, proxy);
    } catch (e) {
        console.log((new Date()) + '/eth_getBlock webSocket error ' + e.message)
        connection.sendUTF('Error: ' + e.message);
    }
}

async function eth_getLogs (message, request) {
    let connection = request.accept()
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) await bigTable.saveLog(body.params);
        let result = [(await axios.post(process.env.PROXY_WEB_HOST + '/eth_getLogs', message)).data];
        let stream = await bigTable.readLog();
        stream.on('error', err => {console.error(err)})
            .on('data', row => {result.push(row.data.x)})
            .on('end', () => {
                connection.sendUTF(result);
            });
    } catch (e) {
        console.log((new Date()) + '/eth_getLogs webSocket error ' + e.message)
        connection.sendUTF('Error: ' + e.message);
    }
}

async function eth_getTxReceipt (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) {
            await bigTable.saveLog(body.params);
            connection.sendUTF('Request saved!');
        }
        else
            await proxyWebsocket(request, socket, head, proxy);
    } catch (e) {
        console.log((new Date()) + '/eth_getTxReceipt webSocket error ' + e.message)
        connection.sendUTF('Error: ' + e.message);
    }
}

module.exports = {eth_getBlock, eth_getLogs, eth_getTxReceipt}