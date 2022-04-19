require('dotenv').config()
const https = require('https');
const WebSocketServer = require('websocket').server;
const httpProxy = require('http-proxy');
const { proxyOptions, httpsOptions } = require('./constants.js')
const proxy = httpProxy.createProxyServer(proxyOptions);
const { handleProxyRequest, handleError} = require('./utils/proxy')
const { validateWsMessage, validateWebRequest } = require('./utils/validator');
const routes = require('./routes/root')
const wsRoute = require('./websocket/root')

server = https.createServer(httpsOptions, function (req, res) {
    let bodyStr = "";
    let body = {};
    req.on("data",  async (chunk) => {
        bodyStr += chunk;
        body = JSON.parse(bodyStr);
        try {
            if(await validateWebRequest(req, res, body)) {
                console.log(new Date() + ' web request claimed')
                if(body.method === 'eth_getBlockByHash') await routes.eth_getBlockByHash(req, res, proxy, body)
                else if(body.method === 'eth_getBlockByName') await routes.eth_getBlockByName(req, res, proxy, body)
                else if(body.method === 'eth_getBlockTransactionCountByHash') await routes.eth_getBlockTransactionCountByHash(req, res, proxy, body)
                else if(body.method === 'eth_getBlockTransactionCountByNumber') await routes.eth_getBlockTransactionCountByNumber(req, res, proxy, body)
                else if(body.method === 'eth_getLogs') await routes.eth_getLogs(req, res, proxy, body)
                else if(body.method === 'eth_getTxReceipt') await routes.eth_getTxReceipt(req, res, proxy, body)
                else proxy.web(req, res, { target: process.env.PROXY_WEB_HOST })
                handleProxyRequest(proxy, res, bodyStr)
                handleError(proxy, res)
            }
        } catch (e) {
            console.error(new Date() + 'request error: ' +  e.message)
            console.error(e.stack)
            res.writeHead(500)
            res.end(e.message)
        }
    });
});

// Redirect from http port 9000 to https
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(process.env.SERVER_PORT);


wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
})

wsServer.on('request', async function(request) {
    let connection = request.accept();
    connection.on('message', async function(message) {
        let body = JSON.parse(message);
        if(await validateWsMessage(connection, body)) {
            if(body.method === 'eth_getBlockByHash') await wsRoute.eth_getBlockByHash(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else if(body.method === 'eth_getBlockByNumber') await wsRoute.eth_getBlockByName(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else if(body.method === 'eth_getBlockTransactionCountByHash') await wsRoute.eth_getBlockTransactionCountByHash(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else if(body.method === 'eth_getBlockTransactionCountByNumber') await wsRoute.eth_getBlockTransactionCountByNumber(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else if(body.method === 'eth_getLogs') await wsRoute.eth_getLogs(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else if(body.method === 'eth_getTxReceipt') await wsRoute.eth_getTxReceipt(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else proxy.ws(request, request.socket, request.httpRequest.rawHeaders, { target: process.env.PROXY_HOST, ws: true, secure: false })        }
    })
    console.log((new Date()) + ' Connection accepted.');
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

module.exports = server