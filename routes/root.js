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
            if(isRequestToOld) {
                await bigTable.saveBlock(body.params);
                reply.writeHead(200)
                reply.end(JSON.stringify({message: 'Request saved'}))
            } else proxy.web(req, reply, { target: process.env.PROXY_WEB_HOST });
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
            let result = [(await axios.post(process.env.PROXY_WEB_HOST + '/eth_getLogs', body)).data];
            let readStream = await bigTable.readLog();
            readStream.on('error', err => {console.error(err)})
                .on('data', row => {result.push(row.data.x)})
                .on('end', () => {
                    reply.writeHead(200)
                    reply.end(JSON.stringify(result))
                });
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
            if(isRequestToOld) {
                await bigTable.saveReceipt(body.params);
                reply.writeHead(200)
                reply.end(JSON.stringify({message: 'Request saved'}))
            }
            else proxy.web(req, reply, { target: process.env.PROXY_WEB_HOST });
        } catch (e) {
            console.error(new Date() + '/eth_getTxReceipt error: ' +  e.message)
            console.error(e.stack)
            reply.writeHead(500)
            reply.end(e.message)
        }
    });
}

module.exports = {eth_getBlock, eth_getLogs, eth_getTxReceipt}