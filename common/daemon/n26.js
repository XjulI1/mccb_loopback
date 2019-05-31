'use strict';

const config = require('./config/n26');
const api = require('./config/api');
let N26 = require('n26');
let request = require('request-promise');

module.exports = {
  startDaemon: () => {
    const minuteTomillisecond = 60 * 1000;
    const delay = config.n26.minuteDelay * minuteTomillisecond;
    let accessToken;

    setInterval(importTransactions, delay);

    function importTransactions() {
      let login = config.n26.login;
      let password = config.n26.password;
      let from = Date.now() - delay;
      let to = Date.now();

      const loginAPIrequest = {
        method: 'POST',
        uri: api.protocol + '://' + api.host + ':' + api.port + '/api/Users/login',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: {
          'code': api.secret_key,
        },
        json: true, // Automatically stringifies the body to JSON
      };

      request(loginAPIrequest)
        .then((response) => {
          accessToken = response.id;

          new N26(login, password)
            .then(account => account.transactions({from: from, to: to})
              .then(transactions => postTransactions(transactions)))
            .catch((err) => {
              console.debug(err);
            });
        });
    }

    function postTransactions(transactions) {
      if (transactions.length === 0) {
        return true;
      }

      const transaction = transactions.shift();

      const apiOptions = {
        method: 'POST',
        uri: api.protocol + '://' + api.host + ':' + api.port + '/api/Operations?access_token=' + accessToken,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: {
          'NomOp': transaction.merchantName || transaction.partnerName + ' - ' + transaction.referenceText,
          'MontantOp': transaction.amount,
          'DateOp': (new Date(transaction.visibleTS)).toISOString(),
          'CheckOp': true,
          'IDcompte': api.IDcompte,
          'IDcat': api.IDcat,
        },
        json: true, // Automatically stringifies the body to JSON
      };

      return request(apiOptions)
        .then(() => {
          return postTransactions(transactions);
        })
        .catch((err) => {
          console.debug(err);
        });
    }
  },
};
