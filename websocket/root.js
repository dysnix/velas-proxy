const bigTable = require('../bigtable/bigTableUtil')
const axios = require("axios");

async function eth_getBlock (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) {
            await bigTable.saveBlock(body.params);
            connection.sendUTF('Request saved!');
        }
        else proxy.ws(request, socket, head, { target: 'localhost:8080', ws: true });
    } catch (e) {
        console.log((new Date()) + '/eth_getBlock webSocket error ' + e.message)
        connection.sendUTF('Error: ' + e.message);
    }
}

async function eth_getLogs (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) await bigTable.saveLog(body.params);
        const result = (await axios.get('http://localhost:8080/eth_getLogs')).data;
        result.push(await bigTable.readLog())
        connection.sendUTF(result);
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
        else proxy.ws(request, socket, head, { target: 'localhost:8080', ws: true });
    } catch (e) {
        console.log((new Date()) + '/eth_getTxReceipt webSocket error ' + e.message)
        connection.sendUTF('Error: ' + e.message);
    }
}

module.exports = {eth_getBlock, eth_getLogs, eth_getTxReceipt}