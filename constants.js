const fs = require('fs');

const httpsOptions = {
    key: '',//IMPORTANT!!! path to key file here. USE fs.readFileSync('path/to/key.pem')
    cert: ''//IMPORTANT!!! path to cert file here. USE fs.readFileSync('path/to/cert.pem')
};

const proxyOptions = {
    target: process.env.PROXY_HOST,
    ws: true,
    secure: false,
    ignorePath: true,
    changeOrigin: true
}

module.exports = { httpsOptions, proxyOptions }
