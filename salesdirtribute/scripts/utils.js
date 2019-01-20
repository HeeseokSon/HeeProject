require('dotenv').config();
const csv = require('csvtojson');
const Iconv = require('iconv').Iconv;
const fs = require('fs');
const util = require('util');

const convertEncoding = ({ data, from, to }) => {
  const buffer = new Buffer(data, 'binary');
  const converter = new Iconv(from, to);
  return converter.convert(buffer).toString(to);
};

const readCsvWithConversion = ({ path, from, to }) => {
  const inputData = convertEncoding(
    {
      data: fs.readFileSync(path),
      from: from,
      to: to
    }
  );

  return csv().fromString(inputData);
};

const asyncForEach = async (array, callback) => {
  for(let index = 0; index < array.length; ++index) {
    await callback(array[index], index);
  }
};

const asyncSleep = util.promisify(setTimeout);
const mysqlssh = require('mysql-ssh');

const asyncDBList = async(callback) => {
  mysqlssh.connect(
      {
          host: '13.124.211.41',
          user: 'ec2-user',
          privateKey: fs.readFileSync( process.cwd() + '/emergency-db.pem')
      },
      {
          host: 'prod-chainb-exchange.cluster-c96sjzsh7dzo.ap-northeast-2.rds.amazonaws.com',
          user: 'heeseokson',
          password: 'hsk1220',
          database: 'chainbexchange'
      }
  )
  .then(client => {
    client.query('SELECT ieos.symbol, accounts.member_id, address, volume as amount, accounts.currency ' +
                 'FROM (((chainbexchange.ieo_trades inner join chainbexchange.ieos on ieo_trades.ieo_id = ieos.id)' +
                 '        inner join chainbexchange.accounts on ieo_trades.member_id = accounts.member_id) ' +
                 '        left outer join chainbexchange.payment_addresses on accounts.id = payment_addresses.account_id ) ' +
                 'WHERE (symbol = \'MACH\' and accounts.currency = \'21\') ' + 
                 'order by member_id;', 
    function (err, results, fields) {
        if (err) throw err;
        mysqlssh.close();

        console.log(results.length);
        callback = results;
        resolve( results );
      })
    })
    .catch(err => { 
        reject( err );
    })   
    await callback;
  }

module.exports = {
  readCsvWithConversion: readCsvWithConversion,
  asyncSleep: asyncSleep,
  asyncForEach: asyncForEach,
  asyncDBList: asyncDBList 
};
