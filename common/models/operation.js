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
    let SQLrequest = 'SELECT ROUND(SUM(MontantOp), 2) as MonthNegative ' +
      'FROM Operation ' +
      'NATURAL JOIN Compte ' +
      'WHERE MONTH(DateOp) = ' + MonthNumber + ' ' +
      'AND YEAR(DateOp) = ' + YearNumber + ' ' +
      'AND Compte.IDuser = ' + UserID + ' ' +
      'AND IDcat IN ' +
      '(SELECT IDcat FROM Categorie WHERE Stats = 1 AND IDuser IN (0, ' + UserID + '))';

    if (IDCompte) {
      SQLrequest += 'AND IDCompte = ' + IDCompte;
    }

    Operation.dataSource.connector.executeSQL(SQLrequest, [], [], (err, data) => {
      cb(null, data);
    });
  };

  Operation.sumCategoriesByUserByMonth = function(UserID, MonthNumber, YearNumber, cb) {
    let SQLrequest = 'SELECT ROUND(SUM(MontantOp), 2) as TotalMonth, IDcat ' +
      'FROM Operation ' +
      'NATURAL JOIN Compte ' +
      'WHERE MONTH(DateOp) = ' + MonthNumber + ' ' +
      'AND YEAR(DateOp) = ' + YearNumber + ' ' +
      'AND Compte.IDuser = ' + UserID + ' ' +
      'AND IDcat IN ' +
      '(SELECT IDcat FROM Categorie WHERE Stats = 1 AND IDuser IN (0, ' + UserID + ')) ' +
      'GROUP BY IDcat';

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

  Operation.remoteMethod('sumCategoriesByUserByMonth', {
    accepts: [{
      arg: 'userID',
      type: 'number',
    }, {
      arg: 'monthNumber',
      type: 'number',
    }, {
      arg: 'yearNumber',
      type: 'number',
    }],
    returns: {arg: 'results', type: 'object'},
    http: {
      verb: 'get',
    },
  });
};
