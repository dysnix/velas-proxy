'use strict'
function handleProxyError(proxy, res, body) {
    proxy.on('error', (e) => handleError(res, body, e));
    proxy.on('uncaughtException', (e) => handleError(res, body, e));
    proxy.on('unhandledRejection', e => handleError(res, body, e));
    proxy.on('unhandledErrors', e => handleError(res, body, e));
}


function handleRequestError(req, res, body) {
    req.on("error", (e) => handleError(res, body, e));
    req.on('uncaughtException', (e) => handleError(res, body, e));
    req.on('unhandledRejection', (e) => handleError(res, body, e));
    req.on('unhandledErrors', (e) => handleError(res, body, e));
}

function handleError(res, body, e) {
    console.error(`Error when proxy request ${body.method}: ${e.message}`)
    try {
        res.writeHead(502)
        res.end(JSON.stringify(buildErrorJsonrpcObject(e.message, body.id)))
    } catch (e) {
        console.error(`${body.method} response socket already closed!`)
        res.end()
    }
}

function buildErrorJsonrpcObject(error, id) {
    return {
        jsonrpc: "2,0",
        error: error,
        id: id
    }
}

module.exports = { handleRequestError, handleError, handleProxyError, buildErrorJsonrpcObject }