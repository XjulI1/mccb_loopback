'use strict'

module.exports = function (Stats) {
  Stats.evolutionSolde = function (UserID, cb) {
    const queryTotal = '' +
      'SELECT ROUND(SUM(MontantOp),2) AS montant, ' +
      'DATE_FORMAT(DateOp, \'%Y-%m-%dT00:00:00.000Z\') AS date ' +
      'FROM Operation NATURAL JOIN Compte ' +
      'WHERE IDuser = ' + UserID + ' ' +
      'GROUP BY date ' +
      'ORDER BY DateOp ASC'

    const queryDispo = '' +
      'SELECT ROUND(SUM(MontantOp),2) AS montant, ' +
      'DATE_FORMAT(DateOp, \'%Y-%m-%dT00:00:00.000Z\') AS date ' +
      'FROM Operation NATURAL JOIN Compte ' +
      'WHERE IDuser = ' + UserID + ' AND bloque = 0' +
      'GROUP BY date ' +
      'ORDER BY DateOp ASC'

    Stats.dataSource.connector.executeSQL(queryTotal, [], [], (err, dataTotal) => {
      Stats.dataSource.connector.executeSQL(queryTotal, [], [], (err, dataDispo) => {
        cb(null, {
          total: dataTotal,
          dispo: dataDispo
        })
      })
    })
  }

  Stats.remoteMethod('evolutionSolde', {
    accepts: [{
      arg: 'userID',
      type: 'number'
    }],
    returns: { arg: 'results', type: 'object' },
    http: {
      verb: 'get'
    }
  })
}
