async function proxyRequest(req, reply, proxy) {
    await proxy.web(req, reply, { target: process.env.PROXY_WEB_HOST });
}

async function proxyRequestNoHandle(req, reply, proxy) {
    await proxy.web(req, reply, { target: process.env.PROXY_WEB_HOST });
}

async function proxyRequestToTarget(req, reply, proxy, targetHost) {
    await proxy.web(req, reply, { target: targetHost });
}

async function proxyWebsocket(request, socket, head, proxy) {
    proxy.ws(request, socket, head, { target: process.env.PROXY_HOST, ws: true, selfHandleResponse : true  });
}

async function proxyWebsocketNoHandle(request, socket, head, proxy) {
    proxy.ws(request, socket, head, { target: process.env.PROXY_HOST, ws: true  });
}

function handleError(proxy, res, body) {
    proxy.on('error', (e) => {
        console.error(`Error when proxy request ${body.method}: ${e.message}`)
        try {
            res.writeHead(502)
            res.end(JSON.stringify({message: e.message}))
        } catch (e) {
            console.error(`${body.method} response socket already closed!`)
            res.end()
        }
    })
}

function handleProxyRequest(proxy, res, body) {
    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        if(body !== '') {
            proxyReq.write(body);
            body = '';
        }
    });
}

module.exports = { proxyRequest, proxyWebsocket, proxyRequestNoHandle, proxyWebsocketNoHandle, handleError, handleProxyRequest, proxyRequestToTarget }