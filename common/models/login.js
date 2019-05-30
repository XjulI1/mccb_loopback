'use strict';

const loginConfig = require('./config/login');

module.exports = function(Login) {
  Login.checkCode = function(code, cb) {
    if (code === loginConfig.secret_key) {
      cb(null, {
        code: '200',
        status: 'valid',
        userID: 1,
      });
    } else {
      cb(null, {
        code: 401,
        status: 'failed',
      });
    }
  };

  Login.remoteMethod('checkCode', {
    accepts: [{
      arg: 'code',
      type: 'number',
    }],
    returns: {arg: 'results', type: 'object'},
    http: {
      verb: 'get',
    },
  });
};
