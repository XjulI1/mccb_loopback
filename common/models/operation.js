'use strict';

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

  Operation.remoteMethod('sumForACompte', {
    accepts: {arg: 'id', type: 'number'},
    returns: {arg: 'results', type: 'object'},
    http: {
      verb: 'get',
    },
  });
};
