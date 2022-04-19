require('dotenv').config()
const ssl = process.env.USE_SSL

if(ssl === 'use') {
    server = require('./ssl')
    server.listen(process.env.SECURE_SERVER_PORT, function () {
        console.log('Velas-proxy server running on port ' + process.env.SECURE_SERVER_PORT)
    });
} else {
    server = require('./noSsl')
    server.listen(process.env.SERVER_PORT, function () {
        console.log('Velas-proxy server running on port ' + process.env.SERVER_PORT)
    });
}