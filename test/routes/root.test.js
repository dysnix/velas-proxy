let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let { describe, it } = require("mocha");
let jest = require('jest-mock');
let bigTableUtils = require('../../utils/bigTableUtil');
let proxy = require('../../utils/proxy');
let assert = require('assert').strict;
chai.use(chaiHttp);

describe('/POST eth_getBlock save', () => {
  it('it should save request for eth_getBlock', (done) => {
      bigTableUtils.saveBlock = jest.fn().mockReturnValue();
      let payload = {
          "jsonrpc": "2.0",
          "id": 748957323232,
          "method": "eth_getBlock"
    }
    chai.request(server)
        .post('/')
        .send(payload)
        .end((err, res) => {
            assert.equal(res.text, '{"message":"Request saved"}')
            assert.equal(res.status, 200)
          done();
        });
  });
});

describe('/POST eth_getBlock proxy', () => {
    it('it should proxy request for eth_getBlock', (done) => {
        proxy.proxyRequest = jest.fn().mockImplementation((req, reply, proxy) => {
            reply.writeHead(200)
            reply.end(JSON.stringify({message: 'Request proxied'}))
        });
        let payload = {
            "jsonrpc": "2.0",
            "id": 7489573,
            "method": "eth_getBlock"
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

describe('/POST eth_getBlock reject', () => {
    it('it should return 400 for eth_getBlock' +
        '', (done) => {
        bigTableUtils.saveBlock = jest.fn().mockReturnValue();
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