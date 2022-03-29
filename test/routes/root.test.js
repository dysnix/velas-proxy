let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let {describe, it} = require("mocha");
let bigTableUtils = require('../../bigtable/bigTableUtil')

chai.use(chaiHttp);

describe("bigTableUtils", function () {
    describe("saveBlock", function () {
        it("Should save bloc to bigTable", async function() {})
    })
})

describe('/POST eth_getBlock', () => {
  it('it should save request for eth_getBlock', (done) => {
    let payload = {
      "id": 748957323232,
      "type": true
    }
    chai.request(server)
        .post('/eth_getBlock')
        .send(payload)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Request saved');
          done();
        });
  });
});
