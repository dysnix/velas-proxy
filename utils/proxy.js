async function proxyRequest(req, reply, proxy) {
    await proxy.web(req, reply, { target: process.env.PROXY_WEB_HOST, secure: false });
}

async function proxyWebsocket(request, socket, head, proxy) {
    proxy.ws(request, socket, head, { target: process.env.PROXY_HOST, ws: true, secure: false });
}

module.exports = {proxyRequest, proxyWebsocket}