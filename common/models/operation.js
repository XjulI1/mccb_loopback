'use strict';

/* eslint max-len: "off" */

module.exports = function(Operation) {
  Operation.sumForACompte = function(CompteID, cb) {
    const sqlChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalChecked ' +
      'FROM Operation ' +
      'WHERE IDcompte = ' + CompteID + ' AND CheckOp = true ' +
      'GROUP BY IDCompte';

    const sqlNotChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalNotChecked ' +
      'FROM Operation ' +
      'WHERE IDcompte = ' + CompteID + ' AND CheckOp = false ' +
      'GROUP BY IDCompte';

    Operation.dataSource.connector.executeSQL(sqlChecked, [], [], (err, data) => {
      const checkedTotal = data;

      Operation.dataSource.connector.executeSQL(sqlNotChecked, [], [], (err, data) => {
        cb(null, Object.assign(checkedTotal[0], data[0]));
      });
    });
  };

  Operation.sumAllCompteForUser = function(UserID, cb) {
    const sqlChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalChecked ' +
      'FROM Operation NATURAL JOIN Compte ' +
      'WHERE IDuser = ' + UserID + ' AND CheckOp = true ' +
      'GROUP BY IDCompte';

    const sqlNotChecked = 'SELECT IDCompte, SUM(MontantOp) as TotalNotChecked ' +
      'FROM Operation NATURAL JOIN Compte  ' +
      'WHERE IDuser = ' + UserID + ' AND CheckOp = false ' +
      'GROUP BY IDCompte';

    Operation.dataSource.connector.executeSQL(sqlChecked, [], [], (err, data) => {
      const checkedTotal = data;

      Operation.dataSource.connector.executeSQL(sqlNotChecked, [], [], (err, data) => {
        checkedTotal.map((objectCheck) => {
          let filterCompte = data.filter(object => object.IDCompte === objectCheck.IDCompte);

          Object.assign(objectCheck, {TotalNotChecked: (filterCompte[0] || 0)['TotalNotChecked']});
        });

        cb(null, checkedTotal);
      });
    });
  };

  Operation.sumByUserByMonth = function(UserID, MonthNumber, YearNumber, IDCompte, cb) {
    let signMontant = '<';

    let SQLrequest = 'SELECT ROUND(SUM(MontantOp), 2) as MonthNegative ' +
      'FROM Operation ' +
      'NATURAL JOIN Compte ' +
      'WHERE DateOp ' +
      'BETWEEN "' + YearNumber + '-' + MonthNumber + '-01" ' +
      'AND "' + (MonthNumber === 12 ? YearNumber + 1 : YearNumber) + '-' + (MonthNumber === 12 ? 1 : MonthNumber + 1) + '-01" ' +
      'AND Compte.IDuser = ' + UserID + ' ' +
      'AND MontantOp ' + signMontant + ' 0 ' +
      'AND IDcat NOT IN(25, 21) ';

    if (IDCompte) {
      SQLrequest += 'AND IDCompte = ' + IDCompte;
    }

    Operation.dataSource.connector.executeSQL(SQLrequest, [], [], (err, data) => {
      cb(null, data);
    });
  };

  Operation.remoteMethod('sumForACompte', {
    accepts: {arg: 'id', type: 'number'},
    returns: {arg: 'results', type: 'object'},
    http: {
      verb: 'get',
    },
  });

  Operation.remoteMethod('sumAllCompteForUser', {
    accepts: {arg: 'userID', type: 'number'},
    returns: {arg: 'results', type: 'object'},
    http: {
      verb: 'get',
    },
  });

  Operation.remoteMethod('sumByUserByMonth', {
    accepts: [{
      arg: 'userID',
      type: 'number',
    }, {
      arg: 'monthNumber',
      type: 'number',
    }, {
      arg: 'yearNumber',
      type: 'number',
    }, {
      arg: 'IDCompte',
      type: 'number',
    }],
    returns: {arg: 'results', type: 'object'},
    http: {
      verb: 'get',
    },
  });
};
