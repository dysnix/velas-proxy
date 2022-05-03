require('dotenv').config()
const http = require('http');
const WebSocketServer = require('websocket').server;
const httpProxy = require('http-proxy');
const { proxyOptions } = require('./constants.js')
const proxy = httpProxy.createProxyServer(proxyOptions);
const { handleWeb } = require('./routes/root')
const { handleWS } = require('./websocket/root')
const { validateWsMessage, validateWebRequest } = require('./utils/validator');
const { handleProxyRequest, handleError } = require("./utils/proxy");

server = http.createServer(async function (req, res) {
    let bodyStr = "";
    let body = {};
    req.on("data",  async (chunk) => {
        bodyStr += chunk;
        body = JSON.parse(bodyStr);
        try {
            if(await validateWebRequest(req, res, body)) {
                console.log(`${body.method} ${new Date()} web request claimed`)
                await handleWeb(req, res, proxy, body);
                handleProxyRequest(proxy, res, bodyStr)
                handleError(proxy, res)
            }
        } catch (e) {
            console.error(new Date() + ' request error: ' +  e.message)
            console.error(e.stack)
            res.writeHead(500)
            res.end(e.message)
        }
    });
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
})

wsServer.on('request', async function(request) {
    let connection = request.accept();
    connection.on('message', async function(message) {
        let body = JSON.parse(message);
        if(await validateWsMessage(connection, body))
            await handleWS(body, message, request, request.socket, request.httpRequest.rawHeaders, proxy)
    })
    console.log((new Date()) + ' Connection accepted.');
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

module.exports = server