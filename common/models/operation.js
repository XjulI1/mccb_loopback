'use strict'

module.exports = function (Operation) {
  Operation.sumForACompte = function (CompteID, cb) {
    const sqlChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalChecked ' +
      'FROM Operation ' +
      'WHERE IDcompte = ' + CompteID + ' AND CheckOp = true ' +
      'GROUP BY IDCompte'

    const sqlNotChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalNotChecked ' +
      'FROM Operation ' +
      'WHERE IDcompte = ' + CompteID + ' AND CheckOp = false ' +
      'GROUP BY IDCompte'

    Operation.dataSource.connector.executeSQL(sqlChecked, [], [], (err, data) => {
      const checkedTotal = data

      Operation.dataSource.connector.executeSQL(sqlNotChecked, [], [], (err, data) => {
        cb(null, Object.assign(checkedTotal[0], data[0]))
      })
    })
  }

  Operation.sumAllCompteForUser = function (UserID, cb) {
    const sqlChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalChecked ' +
      'FROM Operation NATURAL JOIN Compte ' +
      'WHERE IDuser = ' + UserID + ' AND CheckOp = true ' +
      'GROUP BY IDCompte'

    const sqlNotChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalNotChecked ' +
      'FROM Operation NATURAL JOIN Compte  ' +
      'WHERE IDuser = ' + UserID + ' AND CheckOp = false ' +
      'GROUP BY IDCompte'

    Operation.dataSource.connector.executeSQL(sqlChecked, [], [], (err, data) => {
      const checkedTotal = data

      Operation.dataSource.connector.executeSQL(sqlNotChecked, [], [], (err, data) => {
        checkedTotal.map((objectCheck) => {
          let filterCompte = data.filter(object => JSON.parse(JSON.stringify(object)).IDCompte === JSON.parse(JSON.stringify(objectCheck)).IDCompte)

          Object.assign(objectCheck, { TotalNotChecked: JSON.parse(JSON.stringify(filterCompte[0] || 0))['TotalNotChecked'] })
        })

        cb(null, checkedTotal)
      })
    })
  }

  Operation.remoteMethod('sumForACompte', {
    accepts: { arg: 'id', type: 'number' },
    returns: { arg: 'results', type: 'object' },
    http: {
      verb: 'get'
    }
  })

  Operation.remoteMethod('sumAllCompteForUser', {
    accepts: { arg: 'userID', type: 'number' },
    returns: { arg: 'results', type: 'object' },
    http: {
      verb: 'get'
    }
  })
}
