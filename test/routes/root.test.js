let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let { describe, it } = require("mocha");
let jest = require('jest-mock');
let bigTableUtils = require('../../utils/bigTableUtil');
let proxy = require('../../utils/proxy');
let MockAdapter = require('axios-mock-adapter');
let axios = require('axios')
let assert = require('assert').strict;
chai.use(chaiHttp);

describe('/POST eth_getBlockByNumber bigTable read', () => {
  it('it should read data from BigTable for eth_getBlockByNumber', (done) => {
      let payload = {
          "jsonrpc": "2.0",
          "id": 1,
          "method": "eth_getBlockByNumber",
          "params":[
              "0x1955", true
          ]
    }
    chai.request(server)
        .post('/')
        .send(payload)
        .end((err, res) => {
            assert.equal(res.text, '{"jsonrpc":"2,0","error":"Unknown row: 0000000000001955.","id":1}')
            assert.equal(res.status, 200)
          done();
        });
  });
});

describe('/POST eth_getBlockByNumber proxy', () => {
    it('it should proxy request for eth_getBlockByNumber', (done) => {
        bigTableUtils.checkRequestTime = jest.fn().mockImplementation((blockNumber) => { return false });
        proxy.proxyRequest = jest.fn().mockImplementation((req, reply, proxy) => {
            reply.writeHead(200)
            reply.end(JSON.stringify({message: 'Request proxied'}))
        });
        let payload = {
            "jsonrpc":"2.0",
            "method":"eth_getBlockByNumber",
            "params":[
                "0x2065d38",
                true
            ],
            "id":1
        }

        chai.request(server)
            .post('/')
            .send(payload)
            .end((err, res) => {
                assert.equal(res.text, '{"message":"Request proxied"}')
                assert.equal(res.status, 200)
                done();
            });
    });
})

describe('/POST eth_getBlockByNumber reject', () => {
    it('it should return 400 for eth_getBlockByNumber' +
        '', (done) => {
        let payload = {}
        chai.request(server)
            .post('/')
            .send(payload)
            .end((err, res) => {
                assert.equal(res.status, 400)
                done();
            });
    });
})