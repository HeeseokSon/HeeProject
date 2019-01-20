require('dotenv').config();
const utils = require('./utils');
const EthContract = require('./EthContract');
const fs = require('fs');
const Web3 = require('web3');
const path = require('path');

const distribute = async (inputFilePath) => {

  /**
   * output
   */

  const web3 = new Web3(process.env.WEB3_PROVIDER);
  const abiFilePath = path.resolve(__dirname, 'resources', 'tokenAbi.json');
  const abi = JSON.parse(fs.readFileSync(abiFilePath));

  const tokenContract = new EthContract({
    _web3: web3,
    _abi: abi,
    _address: process.env.TOKEN_CONTRACT,
    _chainId: process.env.CHAIN_ID,
  });

  const senderPrivKey = process.env.PRIVATE_KEY;

  const account = web3.eth.accounts.privateKeyToAccount('0x' + senderPrivKey);
  const baseNonce = await web3.eth.getTransactionCount(account.address);

  const outputFilePath = path.resolve(__dirname, 'output', `dist_out_${parseInt(Math.random() * 100000)}.csv`);
  const outputFile = fs.createWriteStream(outputFilePath, { flags: 'w' });

  console.log('Sending transactions... \n' + outputFilePath);

  await outputFile.write('address,amount,txid,status\n');

  /**
   * input
   */

  const distributers = await utils.readCsvWithConversion({
    path: inputFilePath,
    from: 'euc-kr',
    to: 'utf-8'
  });

  //await utils.asyncDBList( function (distributers) {} );
  /**
   * sending trx
   */
  let sentTrxCount = 0;

  await utils.asyncForEach(
    distributers,
    async (distributer, index) => {
      const BN = web3.utils.BN;
      const valid = web3.utils.isAddress(distributer.address) &&
        web3.utils.checkAddressChecksum(distributer.address);

      if (!valid) {
        console.log(`${distributer.address} is invalid Ethereum address`);

        outputFile.write(`${distributer.address},${distributer.amount},null,INVALID\n`)
      }
      else {
        const balance = new BN(await web3.eth.getBalance(distributer.address));
        const threshold = new BN(process.env.SUSPICION_THRESHOLD);

        if (balance.gte(threshold)) {
          console.log(`${distributer.address} has suspicious balance: ${balance.toString()}`);

          outputFile.write(`${distributer.address},${distributer.amount},null,SUSPICIOUS\n`)
        }
        else {
          console.log(`Sending ${distributer.amount} SYNCO to ${distributer.address}`);

          await utils.asyncSleep(2000); //Fail 발생 방지 딜레이 

          tokenContract.distributeWithNonce(
            {
              _nonce: (parseInt(baseNonce) + sentTrxCount++).toString(),
              _to: distributer.address,
              _amount: distributer.amount,
              _privKey: senderPrivKey
            }
          ).then(
            (receipt) => {
              outputFile.write(`${distributer.address},${distributer.amount},${receipt.transactionHash},${receipt.status}\n`);
            }
          );
        }
      }
    }
  )
};

distribute(process.argv[2]);
