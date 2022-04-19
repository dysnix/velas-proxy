const bigTable = require('../utils/bigTableUtil.js');
const proxyUtil = require('../utils/proxy')

async function eth_getBlockByHash (req, reply, proxy, body) {
    await proxyUtil.proxyRequest(req, reply, proxy);
    let data = false;
    if (await bigTable.checkRequestTime(body.id)) {
        data = await bigTable.readBlock(body.params, process.env.GOOGLE_BIGTABLE_BLOCK_BY_HASH_TABLE_ID);
    }
    await proxyUtil.handleProxyResponse(proxy, reply, data)
}

async function eth_getBlockByName (req, reply, proxy, body) {
    await proxyUtil.proxyRequest(req, reply, proxy);
    let data = false;
    if (await bigTable.checkRequestTime(body.id)) {
        data = await bigTable.readBlock(body.params, process.env.GOOGLE_BIGTABLE_BLOCK_TABLE_ID);
    }
    await proxyUtil.handleProxyResponse(proxy, reply, data)
}

async function eth_getBlockTransactionCountByHash (req, reply, proxy, body) {
    await proxyUtil.proxyRequestNoHandle(req, reply, proxy);
}

async function eth_getBlockTransactionCountByNumber (req, reply, proxy, body) {
    await proxyUtil.proxyRequestNoHandle(req, reply, proxy);
}

async function eth_getLogs (req, reply, proxy, body) {
    await proxyUtil.proxyRequest(req, reply, proxy);
    let data = false;
    if (await bigTable.checkRequestTime(body.id)) {
        data = await bigTable.readLog(body.params);
    }
    await proxyUtil.handleProxyResponse(proxy, reply, data)
}

async function eth_getTxReceipt (req, reply, proxy, body) {
    await proxyUtil.proxyRequest(req, reply, proxy);
    let data = false;
    if (await bigTable.checkRequestTime(body.id)) {
        data = await bigTable.readReceipt(body.params);
    }
    await proxyUtil.handleProxyResponse(proxy, reply, data)
}


module.exports = { eth_getBlockByHash, eth_getLogs, eth_getTxReceipt, eth_getBlockByName, eth_getBlockTransactionCountByHash, eth_getBlockTransactionCountByNumber }