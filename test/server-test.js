var ocsp = require('../');
var fixtures = require('./fixtures');

var assert = require('assert');
var https = require('https');

describe('OCSP Server', function() {
  var issuer = fixtures.certs.issuer;
  var good = fixtures.certs.good;
  var revoked = fixtures.certs.revoked;

  it('should provide ocsp response to the client', function(cb) {
    var server = ocsp.Server.create({
      cert: issuer.cert,
      key: issuer.key
    });

    server.addCert(43, 'good');
    server.addCert(44, 'revoked', {
      revocationTime: new Date(),
      revocationReason: 'CACompromise'
    });

    server.listen(8000, function() {
      ocsp.check({
        cert: good.cert,
        issuer: issuer.cert
      }, function(err, res) {
        if (err)
          throw err;

        assert.equal(res.type, 'good');

        next();
      });
    });

    function next() {
      ocsp.check({
        cert: revoked.cert,
        issuer: issuer.cert
      }, function(err, res) {
        assert(err);
        assert.equal(res.type, 'revoked');
        cb();
      });
    }
  });
});
