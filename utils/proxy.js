async function proxyRequest(req, reply, proxy) {
    await proxy.web(req, reply, { target: process.env.PROXY_WEB_HOST, selfHandleResponse : true });
}

async function proxyRequestNoHandle(req, reply, proxy) {
    await proxy.web(req, reply, { target: process.env.PROXY_WEB_HOST });
}

async function proxyWebsocket(request, socket, head, proxy) {
    proxy.ws(request, socket, head, { target: process.env.PROXY_HOST, ws: true, selfHandleResponse : true  });
}

async function proxyWebsocketNoHandle(request, socket, head, proxy) {
    proxy.ws(request, socket, head, { target: process.env.PROXY_HOST, ws: true  });
}

async function handleWsProxy(proxy, connection, data) {
    proxy.on('proxyRes', async (proxyRes, request, res) => {
        let encoder = getEncoder(proxyRes.rawHeaders[proxyRes.rawHeaders.indexOf('Content-Encoding') + 1])
        proxyRes.pipe(encoder)
        let resBody = Buffer.from('');
        encoder.on('data', function(data) {
            resBody = Buffer.concat([resBody, data]);
        });
        encoder.on('end', async function() {
            if(proxyRes.statusCode === 200) {
                resBody = JSON.parse(resBody.toString())
                if(proxyRes.statusCode === 200 && resBody.result) {
                    if(data) resBody.result.push(data)
                    connection.sendUTF(JSON.stringify(resBody))
                } else if(resBody.error) {
                    connection.sendUTF(JSON.stringify(resBody))
                } else {
                    connection.sendUTF(proxyRes.statusMessage)
                }
            }
            connection.sendUTF(proxyRes.statusMessage)
        });
        encoder.on('error', function (e) {
            connection.sendUTF(e.message)
        })
    })
}

async function handleProxyResponse(proxy, reply, data) {
    proxy.on('proxyRes', async (proxyRes, request, res) => {
        let encoder = getEncoder(proxyRes.rawHeaders[proxyRes.rawHeaders.indexOf('Content-Encoding') + 1])
        proxyRes.pipe(encoder)
        let resBody = Buffer.from('');
        encoder.on('data', function(data) {
            resBody = Buffer.concat([resBody, data]);
        });
        encoder.on('end', async function() {
            resBody = JSON.parse(resBody.toString());
            if(proxyRes.statusCode === 200 && resBody.result) {
                if(data) resBody.result.push(data)
                reply.end(JSON.stringify(resBody))
            } else if(resBody.error) {
                reply.end(JSON.stringify(resBody))
            } else {
                reply.writeHead(proxyRes.statusCode)
                reply.end(proxyRes.statusMessage)
            }
            console.log(new Date() + ' response handled')
        });
        encoder.on('error', function (e) {
            console.error(new Date() + ' error on reading: ' + e.message)
            reply.writeHead(500)
            reply.end(e.message)
        })
    })
}

function handleError(proxy, res) {
    proxy.on('error', (e) => {
        console.log(`Error when proxy request: ${e.message}`)
        res.writeHead(500)
        res.end(JSON.stringify({message: e.message}))
    })
}

function handleProxyRequest(proxy, res, body) {
    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        if(body !== '') {
            proxyReq.write(body);
            body = '';
            console.log(new Date() + ' web request proxied')
        }
    });
}

function getEncoder(contentEncoding) {
    switch (contentEncoding) {
        case 'gzip': return require("zlib").createGunzip();
        case 'br': return require("zlib").createBrotliDecompress();
        case 'deflate': return require("zlib").createDeflate();
    }
}

module.exports = { proxyRequest, proxyWebsocket, proxyRequestNoHandle, proxyWebsocketNoHandle, handleProxyResponse, handleWsProxy, handleError, handleProxyRequest }