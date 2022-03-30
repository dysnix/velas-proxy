require('dotenv').config()
const http = require('http');
const WebSocketServer = require('websocket').server;
const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({
    target: process.env.PROXY_HOST,
    ws: true
});
const routes = require('./routes/root')
const wsRoute = require('./websocket/root')
const { validateWsMessage, validateWebRequest } = require('./utils/validator');

server = http.createServer(async function (req, res) {
    let bodyStr = "";
    let body = {};
    req.on("data", async (chunk) => {
        try {
            bodyStr += chunk;
            body = JSON.parse(bodyStr);
            if(await validateWebRequest(req, res, body)) {
                console.log(new Date() + ' web request claimed')
                if(body.method === 'eth_getBlock') await routes.eth_getBlock(req, res, proxy, body)
                else if(body.method === 'eth_getLogs') await routes.eth_getLogs(req, res, proxy, body)
                else if(body.method === 'eth_getTxReceipt') await routes.eth_getTxReceipt(req, res, proxy, body)
                else proxy.web(req, res, {target: process.env.PROXY_WEB_HOST})
            }
        } catch (e) {
            console.error(new Date() + 'request error: ' +  e.message)
            console.error(e.stack)
            res.writeHead(500)
            res.end(e.message)
        }
    });
});

server.listen(process.env.SERVER_PORT, function (){
    console.log('Velas-proxy server running on port ' + process.env.SERVER_PORT)
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
})

wsServer.on('request', async function(request) {
    let connection = request.accept();
    connection.on('message', async function(message) {
        let body = JSON.parse(message);
        if(await validateWsMessage(connection, body)) {
            if(body.method === 'eth_getBlock') await wsRoute.eth_getBlock(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else if(body.method === 'eth_getLogs') await wsRoute.eth_getLogs(message, request)
            else if(body.method === 'eth_getTxReceipt') await wsRoute.eth_getTxReceipt(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
            else proxy.ws(request, request.socket, request.httpRequest.rawHeaders)
        }
    })
    console.log((new Date()) + ' Connection accepted.');
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

module.exports = server