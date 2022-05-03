const bigTable = require('../utils/bigTableUtil.js');
const proxyUtil = require('../utils/proxy');

async function handleWeb(req, res, proxy, body) {
    switch (body.method) {
        case 'eth_getBlockByHash': await eth_getBlockByHash(req, res, proxy, body); break;
        case 'eth_getBlockByNumber': await eth_getBlockByNumber(req, res, proxy, body); break;
        case 'eth_getBlockTransactionCountByHash': await eth_getBlockTransactionCountByHash(req, res, proxy, body); break;
        case 'eth_getBlockTransactionCountByNumber': await eth_getBlockTransactionCountByNumber(req, res, proxy, body); break;
        case 'eth_getLogs': await eth_getLogs(req, res, proxy, body); break;
        case 'eth_getTransactionReceipt': await eth_getTxReceipt(req, res, proxy, body); break;
        default: proxy.web(req, res, { target: process.env.PROXY_WEB_HOST });
    }
}

async function eth_getBlockByHash (req, reply, proxy, body) {
    try {
        let data = await bigTable.readBlockFromBigTable(body.params[0], process.env.GOOGLE_BIGTABLE_BLOCK_BY_HASH_TABLE_ID);
        await mapDataFromBigTableOrProxyRequest(data, body, req, reply, proxy)
    } catch (e) {
        console.error(e.stack)
        reply.end(JSON.stringify(buildErrorJsonrpcObject(e.message, body.id)))
    }
}

async function eth_getBlockByNumber (req, reply, proxy, body) {
    try {
        if (await bigTable.checkRequestTime(body.params[0])) {
            let id = '0'.repeat(16 - body.params[0].replaceAll('0x', '').length).concat(body.params[0].replaceAll('0x', ''))
            let data = await bigTable.readBlockFromBigTable(id, process.env.GOOGLE_BIGTABLE_BLOCK_TABLE_ID);
            await mapDataFromBigTableOrProxyRequest(data, body, req, reply, proxy)
        } else {
            console.log(`${new Date()} web request proxied for ${body.params[0]}`)
            await proxyUtil.proxyRequest(req, reply, proxy);
        }
    } catch (e) {
        console.error(e.stack)
        reply.end(JSON.stringify(buildErrorJsonrpcObject(e.message, body.id)))
    }
}

async function eth_getBlockTransactionCountByHash (req, reply, proxy, body) {
    console.log(`${new Date()} web request proxied for ${body.params[0]}`)
    await proxyUtil.proxyRequestNoHandle(req, reply, proxy);
}

async function eth_getBlockTransactionCountByNumber (req, reply, proxy, body) {
    console.log(`${new Date()} web request proxied for ${body.params[0]}`)
    await proxyUtil.proxyRequestNoHandle(req, reply, proxy);
}

async function eth_getLogs (req, reply, proxy, body) {
    console.log(`${new Date()} web request proxied for ${body.params[0]}`)
    await proxyUtil.proxyRequestNoHandle(req, reply, proxy);
}

async function eth_getTxReceipt (req, reply, proxy, body) {
    try {
        let data = await bigTable.readReceiptFromBigTable(body.params[0]);
        await mapDataFromBigTableOrProxyRequest(data, body, req, reply, proxy)
    } catch (e) {
        console.error(e.stack)
        reply.end(JSON.stringify(buildErrorJsonrpcObject(e.message, body.id)))
    }
}

async function mapDataFromBigTableOrProxyRequest(data, body, req, reply, proxy) {
    if(Object.entries(data).length !== 0) reply.end(JSON.stringify(mapResultToJsonrpcObject(data, body.id)));
    else await proxyUtil.proxyRequest(req, reply, proxy);
}

function mapResultToJsonrpcObject(result, id) {
    return {
        jsonrpc: "2,0",
        result: result ? result : [],
        id: id
    }
}

function buildErrorJsonrpcObject(error, id) {
    return {
        jsonrpc: "2,0",
        error: error,
        id: id
    }
}


module.exports = { handleWeb }