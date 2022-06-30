require('dotenv').config()
const https = require('https');
const WebSocketServer = require('websocket').server;
const httpProxy = require('http-proxy');
const { proxyOptions, httpsOptions } = require('./constants.js')
const proxy = httpProxy.createProxyServer(proxyOptions);
const { handleRequestError, handleProxyError, handleError } = require('./errorHandler.js');
const { handleProxyRequest } = require('./utils/proxy');
const { validateWsMessage, validateWebRequest } = require('./utils/validator');
const { handleWeb } = require('./routes/root')
const { handleWS } = require('./websocket/root')

server = https.createServer(httpsOptions, function (req, res) {
    let bodyStr = "";
    let body = {};
    req.on("data",  async (chunk) => {
        bodyStr += chunk;
        body = JSON.parse(bodyStr);
        try {
            if(await validateWebRequest(req, res, body)) {
                console.log(new Date().getTime() + ' web request claimed')
                await handleWeb(req, res, proxy, body);
                handleProxyRequest(proxy, res, bodyStr)
                handleProxyError(proxy, res, body)
            }
        } catch (e) {
            console.error(`${body.method} ${new Date().getTime()} request error: ${e.message}`)
            handleError(res, body, e);
        }
    });
    handleRequestError(req, res, body)
});

// Redirect from http port 9000 to https
const http = require('http');
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
        if(await validateWsMessage(connection, body))
            await handleWS(body, message, request, request.socket, request.httpRequest.rawHeaders, proxy)
    })
    console.log((new Date().getTime()) + ' Connection accepted.');
    connection.on('close', function(reasonCode, description) {
        console.log((new Date().getTime()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

module.exports = server