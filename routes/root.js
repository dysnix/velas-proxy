const bigTable = require('../bigtable/bigTableUtil.js');
const axios = require('axios')

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
            console.error(new Date() + '/eth_getBlock error: ' +  e.message)
            console.error(e.stack)
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
            const result = (await axios.get('http://localhost:8080/eth_getLogs')).data;
            result.push(await bigTable.readLog())
            reply.writeHead(200)
            reply.end(JSON.stringify(result))
        } catch (e) {
            console.error(new Date() + '/eth_getLogs error: ' +  e.message)
            console.error(e.stack)
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
            console.error(new Date() + '/eth_getTxReceipt error: ' +  e.message)
            console.error(e.stack)
            reply.writeHead(500)
            reply.end(e.message)
        }
    });
}

module.exports = {eth_getBlock, eth_getLogs, eth_getTxReceipt}