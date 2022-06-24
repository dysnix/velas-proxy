'use strict'
const bigTable = require('../utils/bigTableUtil')
const proxyUtil = require("../utils/proxy");
const { buildErrorJsonrpcObject } = require('../errorHandler.js');

async function handleWS(body, message, request, socket, head, proxy) {
    switch (body.method) {
        case 'eth_getBlockByHash': await eth_getBlockByHash(message, request, request.socket, request.httpRequest.rawHeaders, proxy); break;
        case 'eth_getBlockByNumber': await eth_getBlockByNumber(message, request, request.socket, request.httpRequest.rawHeaders, proxy); break;
        case 'eth_getBlockTransactionCountByHash': await eth_getBlockTransactionCountByHash(message, request, request.socket, request.httpRequest.rawHeaders, proxy); break;
        case 'eth_getBlockTransactionCountByNumber': await eth_getBlockTransactionCountByNumber(message, request, request.socket, request.httpRequest.rawHeaders, proxy); break;
        case 'eth_getLogs': await eth_getLogs(message, request, request.socket, request.httpRequest.rawHeaders, proxy); break;
        case 'eth_getTransactionReceipt': await eth_getTxReceipt(message, request, request.socket, request.httpRequest.rawHeaders, proxy); break;
        default: proxy.ws(request, request.socket, request.httpRequest.rawHeaders, { target: process.env.PROXY_HOST, ws: true, secure: false })
    }
}

async function eth_getBlockByHash (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        let data = await bigTable.readBlockFromBigTable(message.params[0], process.env.GOOGLE_BIGTABLE_BLOCK_BY_HASH_TABLE_ID);
        await mapDataFromBigTableOrProxyRequest(data, message, request, socket, head, proxy)
    } catch (e) {
        console.error(e.stack)
        connection.sendUTF(JSON.stringify(buildErrorJsonrpcObject(e.message, message.id)));
    }
}

async function eth_getBlockByNumber (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        if (await bigTable.checkRequestTime(message.params[0])) {
            let id = '0'.repeat(16 - message.params[0].replaceAll('0x', '').length).concat(message.params[0].replaceAll('0x', ''))
            let data = await bigTable.readBlockFromBigTable(id, process.env.GOOGLE_BIGTABLE_BLOCK_TABLE_ID);
            await mapDataFromBigTableOrProxyRequest(data, message, request, socket, head, proxy, connection);
            id = null;
        } else {
            console.log(new Date().getTime() + ' web socket request proxied')
            await proxyUtil.proxyWebsocket(request, socket, head, proxy);
        }
    } catch (e) {
        console.error(e.stack)
        connection.sendUTF(JSON.stringify(buildErrorJsonrpcObject(e.message, message.id)));
    }
}

async function eth_getBlockTransactionCountByHash (message, request, socket, head, proxy) {
    console.log(new Date().getTime() + ' web socket request proxied')
    await proxyUtil.proxyWebsocketNoHandle(request, socket, head, proxy);
}

async function eth_getBlockTransactionCountByNumber (message, request, socket, head, proxy) {
    console.log(new Date().getTime() + ' web socket request proxied')
    await proxyUtil.proxyWebsocketNoHandle(request, socket, head, proxy);
}

async function eth_getLogs (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        if (await bigTable.checkRequestTime(message.params[0].fromBlock) && await bigTable.checkRequestTime(message.params[0].toBlock)) {
            let stream = await bigTable.readLogFromBigTable(message.params);
            let result = []
            stream.on('error', err => {
                console.error(`Error on retrieving data from bigtable ${err.message}`);
                connection.sendUTF(JSON.stringify(buildErrorJsonrpcObject(err.message, message.id)))
            }).on('data', row => {
                result.push(bigTable.readLog(row.data.x.proto))
            }).on('end', async () => {
                await mapDataFromBigTableOrProxyRequest(result, message, request, socket, head, proxy, connection)
            });
            stream.destroy()
        } else {
            console.log(new Date().getTime() + ' web socket request proxied')
            await proxyUtil.proxyWebsocketNoHandle(request, socket, head, proxy);
        }
    } catch (e) {
        console.error(e.stack)
        connection.sendUTF(JSON.stringify(buildErrorJsonrpcObject(err.message, message.id)))
    }
}

async function eth_getTxReceipt (message, request, socket, head, proxy) {
    let connection = request.accept()
    try {
        let data = await bigTable.readReceiptFromBigTable(message.params[0]);
        await mapDataFromBigTableOrProxyRequest(data, message, request, socket, head, proxy, connection)
    } catch (e) {
        console.error(e.stack)
        connection.sendUTF(JSON.stringify(buildErrorJsonrpcObject(e.message, message.id)));
    }
}

async function mapDataFromBigTableOrProxyRequest(data, message, request, socket, head, proxy, connection) {
    if(Object.entries(data).length !== 0)  connection.sendUTF(JSON.stringify(mapResultToJsonrpcObject(data, message.id)));
    else await proxyUtil.proxyWebsocket(request, socket, head, proxy);
    data = {} = null
}

function mapResultToJsonrpcObject(result, id) {
    return {
        jsonrpc: "2,0",
        result: result ? result : [],
        id: id
    }
}

module.exports = { handleWS }