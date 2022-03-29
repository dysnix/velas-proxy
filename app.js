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

server = http.createServer(async function (req, res) {
    if(req.url === '/eth_getBlock') await routes.eth_getBlock(req, res, proxy)
    else if(req.url === '/eth_getLogs') await routes.eth_getLogs(req, res, proxy)
    else if(req.url === '/eth_getTxReceipt') await routes.eth_getTxReceipt(req, res, proxy)
    else proxy.web(req, res, {target: process.env.PROXY_WEB_HOST})
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
        if(request.resource === '/eth_getBlock') await wsRoute.eth_getBlock(message, request, request.socket, request.httpRequest.rawHeaders, proxy)
        else if(request.resource === '/eth_getLogs') await wsRoute.eth_getLogs(connection)
        else if(request.resource === '/eth_getTxReceipt') await wsRoute.eth_getTxReceipt(connection)
        else proxy.ws(request, request.socket, request.httpRequest.rawHeaders)
    })
    console.log((new Date()) + ' Connection accepted.');
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

module.exports = server
//---------------------------------------------------testing proxy server----------------------------------------------
server2 = http.createServer(async function (req, res) {
    console.log('received')
    res.writeHead(200);
    res.end('All good')
})
wsServer2 = new WebSocketServer({
    httpServer: server2,
    autoAcceptConnections: false
})
wsServer2.on('request', function(request) {
    let connection = request.accept();
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
server2.listen(8080)