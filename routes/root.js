const bigTable = require('../utils/bigTableUtil.js');
const axios = require('axios')
const proxyUtil = require('../utils/proxy')

async function eth_getBlock (req, reply, proxy, body) {
    let isRequestToOld = await bigTable.checkRequestTime(body.id);
    if(isRequestToOld) {
        await bigTable.saveBlock(body.params);
        reply.writeHead(200)
        reply.end(JSON.stringify({message: 'Request saved'}))
    } else
        await proxyUtil.proxyRequest(req, reply, proxy);
}

async function eth_getLogs (req, reply, proxy, body) {
    let isRequestToOld = await bigTable.checkRequestTime(body.id);
    if (isRequestToOld) await bigTable.saveBlock(body.params);
    let result = [(await axios.post(process.env.PROXY_WEB_HOST, body)).data];
    let readStream = await bigTable.readLog();
    readStream.on('error', err => {console.error(err)})
        .on('data', row => {result.push(row.data.x)})
        .on('end', () => {
            reply.writeHead(200)
            reply.end(JSON.stringify(result))
        });

}

async function eth_getTxReceipt (req, reply, proxy, body) {
    let isRequestToOld = await bigTable.checkRequestTime(body.id);
    if(isRequestToOld) {
        await bigTable.saveReceipt(body.params);
        reply.writeHead(200)
        reply.end(JSON.stringify({message: 'Request saved'}))
    } else await proxyUtil.proxyRequest(req, reply, proxy)

}


module.exports = { eth_getBlock, eth_getLogs, eth_getTxReceipt }