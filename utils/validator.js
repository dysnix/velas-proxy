async function validateWebRequest(req, reply, body) {
    if(req.method !== "POST" && req.method !== "OPTIONS") {
        reply.writeHead(400)
        reply.end("Request should be POST or OPTIONS!")
        return false
    }
    if(!body.jsonrpc && !body.id) {
        reply.writeHead(400)
        reply.end("Request should be a valid jsonrpc request!")
        return false
    }
    return true
}

async function validateWsMessage(connection, message) {
    if(!message.jsonrpc && !message.id) {
        connection.sendUTF('Message should be a valid jsonrpc request!');
        return false
    }
    return true
}

module.exports = {validateWsMessage, validateWebRequest}