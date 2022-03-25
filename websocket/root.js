const bigTable = require('../bigtable/bigTableUtil')

async function eth_getBlock (message, request, socket, head, proxy) {
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) await bigTable.saveBlock(body.params);
        else proxy.ws(request, socket, head, { target: 'http://localhost:8080' });
    } catch (e) {
        console.log((new Date()) + '/eth_getBlock webSocket error ' + e.message)
    }
}

async function eth_getLogs (message, request, socket, head, proxy) {
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) await bigTable.saveLog(body.params);
        else proxy.ws(request, socket, head, { target: 'http://localhost:8080' });
    } catch (e) {
        console.log((new Date()) + '/eth_getBlock webSocket error ' + e.message)
    }
}

async function eth_getTxReceipt (message, request, socket, head, proxy) {
    try {
        let body = JSON.parse(message);
        let isRequestToOld = await bigTable.checkRequestTime(body.id);
        if(isRequestToOld) await bigTable.saveLog(body.params);
        else proxy.ws(request, socket, head, { target: 'http://localhost:8080' });
    } catch (e) {
        console.log((new Date()) + '/eth_getBlock webSocket error ' + e.message)
    }
}

module.exports = {eth_getBlock, eth_getLogs, eth_getTxReceipt}