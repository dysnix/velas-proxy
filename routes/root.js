const bigTable = require('../bigtable/bigTableUtil.js');
const request = require('request')

async function eth_getBlock (req, reply, proxy) {
    let bodyStr = "";
    let body = {};
    req.on("data", async (chunk) => {
        try {
            bodyStr += chunk;
            body = JSON.parse(bodyStr);
            let isRequestToOld = await bigTable.checkRequestTime(body.id);
            if(isRequestToOld) await bigTable.saveBlock(body.params);
            else proxy.web(req, reply, { target: 'http://localhost:8080' });
        } catch (e) {
            reply.writeHead(500)
            reply.end(e.message)
        }
    });
}

async function eth_getLogs (req, reply, proxy) {
    let bodyStr = "";
    let body = {};
    req.on("data", async (chunk) => {
        try {
            bodyStr += chunk;
            body = JSON.parse(bodyStr);
            let isRequestToOld = await bigTable.checkRequestTime(body.id);
            if (isRequestToOld) await bigTable.saveBlock(body.params);
            const result = proxy.web(req, reply, {target: 'http://localhost:8080'});
            result.push(await bigTable.readLog(body.params.address))
            reply.writeHead(200)
            reply.end(JSON.stringify(result))
        } catch (e) {
            reply.writeHead(500)
            reply.end(e.message)
        }
    })
}

async function eth_getTxReceipt (req, reply, proxy) {
    let bodyStr = "";
    let body = {};
    req.on("data", async (chunk) => {
        try {
            bodyStr += chunk;
            body = JSON.parse(bodyStr);
            let isRequestToOld = await bigTable.checkRequestTime(body.id);
            if(isRequestToOld) await bigTable.saveReceipt(body.params);
            else proxy.web(req, reply, { target: 'http://localhost:8080' });
        } catch (e) {
            reply.write({ success: false })
            reply.end
        }
    });
}

module.exports = {eth_getBlock, eth_getLogs, eth_getTxReceipt}