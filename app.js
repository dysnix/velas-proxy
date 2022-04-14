require('dotenv').config()
const environment = process.env.NODE_ENV

if(environment === 'production') {
    server = require('./prod')
    server.listen(process.env.SECURE_SERVER_PORT, function () {
        console.log('Velas-proxy server running on port ' + process.env.SECURE_SERVER_PORT)
    });
} else {
    server = require('./dev')
    server.listen(process.env.SERVER_PORT, function () {
        console.log('Velas-proxy server running on port ' + process.env.SERVER_PORT)
    });
}