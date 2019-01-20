'use strict';
const CJson = require("comment-json");
const fs = require("fs");
var csv = require("csv");

const mysqlssh = require('mysql-ssh');
global.logger = require('../logger');

let logger = global.logger;

const asyncForEach = async (array, callback) => {
    for(let index = 0; index < array.length; ++index) {
      await callback(array[index], index);
    }
  };

async function getSSLTunnelMySQL(web3) {
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
        client.query('SELECT txid FROM chainbexchange.payment_transactions where aasm_state = \'confirmed\' and txout = 0  and ( payment_transactions.currency <> 2 and payment_transactions.currency <> 4 and payment_transactions.currency <> 5 and payment_transactions.currency <> 6 and payment_transactions.currency <> 7 and payment_transactions.currency <> 8 and payment_transactions.currency <> 9 ) order by receive_at desc;', 
        function (err, results, fields) {
            if (err) throw err
            mysqlssh.close();

            var failcount = 0;
            var success = 0;
            var except = 0;
            var total = results.length;

            console.log( 'transaction status check start process === total : ' + results.length );

            asyncForEach( results, async (element, index) => {
                if ( checkTransationFail( element.txid, web3 ) ) {
                    if ( writeFailHistory( element.txid ) ) {
                        except = except + 1;
                    }
                    else {
                        failcount = failcount + 1;
                    }
                }else {
                    success = success + 1;         
                }
                console.log( 'processing  : '+  (success + except + failcount) + '/' + total + ' fail : ' + failcount + ' except : ' + except + ' success : ' + success );
                if ( index === total ) {
                    console.log( 'transaction status check end process! === total : ' + total );
                    console.log( 'final fail : ' + failcount + ' except : ' + except + ' success : ' + success );        
                }
            });

        })
    })
    .catch(err => { 
        reject( err );
    })    
} 

function readCVS( filepath ) {
    var csvObj = csv();

    cvsObj.from.path( filepath ).to.array( function(data) {
    } )
}

function loadConfig(config_name) {
    let enc_file = process.cwd() + "/config/" + config_name + "_org.json";

    if (fs.existsSync(enc_file)) {
        let contents = fs.readFileSync(enc_file);
        let config_enc = CJson.parse(contents);

        config_enc.EOS.connect_info.httpEndpoint = 'https://eos.greymass.com:443';
        return config_enc;
    }
}

function checkTransationFail(hash, web3ex) {
    try {
        if (hash.slice(0,2) !== '0x' ) return true;

        let txReceipt = web3ex.eth.getTransactionReceipt(hash);
        if (txReceipt === null || parseInt(txReceipt.status, 16) === 0) {
            //resp.send(_make_ret('Receipt Status Failed.', 'error'));
            return true;
        }    
    }catch (e){
        throw e;
    }
    return false;
}

function writeFailHistory( txid ) {
    //Block Chain Fail Save 
    if (txid.slice(0,2) !== '0x' ){
        return true;
    } else {
        print( txid );
        return false;
    }
}

function print(log) {
    logger.info(log);
}

async function startCheck() {
    global.config = loadConfig('mainnet');
    logger.init('trascation_fail');

    const Web3Ex = require('../library/web3ex');
    const web3ex = new Web3Ex();
   
    getSSLTunnelMySQL(web3ex);
}

startCheck();