require('dotenv').config()
const ssl = process.env.USE_SSL

Promise.all([require('./utils/bigTableUtil').refreshCashedBlockNumber()]).then()
if(ssl === 'use') {
    server = require('./ssl')
    server.listen(process.env.SECURE_SERVER_PORT, function () {
        console.log('Velas-proxy server running on port ' + process.env.SECURE_SERVER_PORT)
    });
    module.exports = server
} else {
    server = require('./noSsl')
    server.listen(process.env.SERVER_PORT, function () {
        console.log('Velas-proxy server running on port ' + process.env.SERVER_PORT)
    });
    module.exports = server
}