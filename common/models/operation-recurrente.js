'use strict';

module.exports = function(Operationrecurrente) {
  Operationrecurrente.autoGeneration = function(userID, cb) {
    const sqlGet = 'SELECT * FROM OperationRecurrente NATURAL JOIN Compte WHERE IDuser = ' + userID;
    const sqlInsertNewOp = 'INSERT INTO Operation (NomOp, MontantOp, DateOp, IDcompte, IDcat) VALUES ';
    const sqlUpdateOpRec = 'UPDATE OperationRecurrente SET DernierDateOpRecu = "';
    const millisecondDay = 24 * 60 * 60 * 1000;

    const newOpFromRec = function(opRec, list, cbDone) {
      const currentDate = new Date();
      const opLastDate = new Date(opRec.DernierDateOpRecu);

      opLastDate.setHours(12);

      switch (opRec.Frequence) {
        case 3:
          if (currentDate - opLastDate > 15 * millisecondDay) {
            opLastDate.setMonth(opLastDate.getMonth() + 1);

            insertNewOpFromRec(opLastDate, opRec, list, cbDone);
          } else {
            goToNext(list, cbDone);
          }
          break;

        case 7:
          if (currentDate - opLastDate > 335 * millisecondDay) {
            opLastDate.setFullYear(opLastDate.getFullYear() + 1);

            insertNewOpFromRec(opLastDate, opRec, list, cbDone);
          } else {
            goToNext(list, cbDone);
          }
          break;
      }
    };

    const insertNewOpFromRec = function(opLastDate, opRec, list, cbDone) {
      Operationrecurrente.dataSource.connector.executeSQL(
        sqlInsertNewOp + `("${opRec.NomOpRecu}", ${opRec.MontantOpRecu}, "${opLastDate.toISOString().split('T')[0]}", ${opRec.IDcompte}, ${opRec.IDcat})`,
        [],
        [],
        (err, _) => {
          Operationrecurrente.dataSource.connector.executeSQL(
            sqlUpdateOpRec + opLastDate.toISOString().split('T')[0] + `" WHERE IDopRecu = ${opRec.IDopRecu}`,
            [],
            [],
            (err, _) => {
              goToNext(list, cbDone);
            },
          );
        },
      );
    };

    const goToNext = function(list, cbDone) {
      if (list.length > 0) {
        newOpFromRec(list.pop(), list, cbDone);
      } else {
        cbDone(null, 'done');
      }
    };

    Operationrecurrente.dataSource.connector.executeSQL(sqlGet, [], [], (err, data) => {
      newOpFromRec(data.pop(), data, cb);
    });
  };

  Operationrecurrente.remoteMethod('autoGeneration', {
    accepts: [{
      arg: 'userID',
      type: 'number',
    }],
    returns: {args: 'response', type: 'object'},
    http: {
      verb: 'post',
    },
  });
};
