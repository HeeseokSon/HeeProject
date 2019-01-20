const EthereumTx = require('ethereumjs-tx');

class EthContract {
  constructor({ _web3, _abi, _address, _chainId, _defaultGasPrice, _defaultGasLimit }) {
    this.web3 = _web3;
    this.contract = new this.web3.eth.Contract(_abi, _address);
    this.chainId = _chainId;
    this._defaultGasPrice = _defaultGasPrice || null;
    this._defaultGasLimit = _defaultGasLimit || 2000000;
  }

  async defaultGasPrice() {
    return (this._defaultGasPrice !== null) ?
      this._defaultGasPrice : parseInt(await this.web3.eth.getGasPrice());
  }

  async defaultGasLimit() {
    return this._defaultGasLimit;
  }

  async callMutableMethod({ _encodedAbi, _privKey, _gasPrice, _gasLimit }) {
    const privKey = (_privKey.length >= 2 && _privKey.slice(0, 2) === '0x') ?
      _privKey.slice(2) : _privKey;

    const account = this.web3.eth.accounts.privateKeyToAccount('0x' + privKey);
    const nonce = await this.web3.eth.getTransactionCount(account.address);

    const gasPrice = _gasPrice || await this.defaultGasPrice();
    const gasLimit = _gasLimit || await this.defaultGasLimit();

    const toHex = this.web3.utils.toHex;
    const txParams = {
      nonce: nonce,
      gasPrice: toHex(gasPrice),
      gasLimit: toHex(gasLimit),
      to: this.contract.options.address,
      value: '0x0',
      chainId: toHex(this.chainId),
      data: _encodedAbi
    };

    const tx = new EthereumTx(txParams);
    tx.sign(Buffer.from(privKey, 'hex'));

    return await this.web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
  }

  async callMutableMethodWithNonce({ _nonce, _encodedAbi, _privKey, _gasPrice, _gasLimit }) {
    const privKey = (_privKey.length >= 2 && _privKey.slice(0, 2) === '0x') ?
      _privKey.slice(2) : _privKey;

    const nonce = _nonce;
    const gasPrice = _gasPrice || await this.defaultGasPrice();
    const gasLimit = _gasLimit || await this.defaultGasLimit();

    const toHex = this.web3.utils.toHex;
    const txParams = {
      nonce: toHex(nonce),
      gasPrice: toHex(gasPrice),
      gasLimit: toHex(gasLimit),
      to: this.contract.options.address,
      value: '0x0',
      chainId: toHex(this.chainId),
      data: _encodedAbi
    };

    const tx = new EthereumTx(txParams);
    tx.sign(Buffer.from(privKey, 'hex'));

    return await this.web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'));
  }

  async distribute({ _to, _amount, _privKey, _gasPrice, _gasLimit }) {
    const methodName = this.distribute.name;
    if (!this.contract || !this.contract.methods[methodName]) {
      throw Error(`No such method: ${methodName}`)
    }

    const encodedAbi = this.contract.methods[methodName](_to, _amount).encodeABI();
    const gasPrice = _gasPrice || await this.defaultGasPrice();
    const gasLimit = _gasLimit || await this.defaultGasLimit();

    return await this.callMutableMethod({
      _encodedAbi: encodedAbi,
      _privKey: _privKey,
      _gasPrice: gasPrice,
      _gasLimit: gasLimit
    });
  }

  async distributeWithNonce({ _nonce, _to, _amount, _privKey, _gasPrice, _gasLimit }) {
    const methodName = this.distribute.name;
    if (!this.contract || !this.contract.methods[methodName]) {
      throw Error(`No such method: ${methodName}`)
    }

    const encodedAbi = this.contract.methods[methodName](_to, _amount).encodeABI();
    const gasPrice = _gasPrice || await this.defaultGasPrice();
    const gasLimit = _gasLimit || await this.defaultGasLimit();

    return await this.callMutableMethodWithNonce({
      _nonce: _nonce,
      _encodedAbi: encodedAbi,
      _privKey: _privKey,
      _gasPrice: gasPrice,
      _gasLimit: gasLimit
    });
  }

  async AddWhitelist({ _account, _privKey, _gasPrice, _gasLimit }) {
    const methodName = this.AddWhitelist.name;
    if (!this.contract || !this.contract.methods[methodName]) {
      throw Error(`No such method: ${methodName}`)
    }

    const encodedAbi = this.contract.methods[methodName](_account).encodeABI();
    const gasPrice = _gasPrice || await this.defaultGasPrice();
    const gasLimit = _gasLimit || await this.defaultGasLimit();

    return await this.callMutableMethod({
      _encodedAbi: encodedAbi,
      _privKey: _privKey,
      _gasPrice: gasPrice,
      _gasLimit: gasLimit
    });
  }

  async AddWhitelistWithNonce({ _nonce, _account, _privKey, _gasPrice, _gasLimit }) {
    const methodName = this.AddWhitelist.name;
    if (!this.contract || !this.contract.methods[methodName]) {
      throw Error(`No such method: ${methodName}`)
    }

    const encodedAbi = this.contract.methods[methodName](_account).encodeABI();
    const gasPrice = _gasPrice || await this.defaultGasPrice();
    const gasLimit = _gasLimit || await this.defaultGasLimit();

    return await this.callMutableMethodWithNonce({
      _nonce: _nonce,
      _encodedAbi: encodedAbi,
      _privKey: _privKey,
      _gasPrice: gasPrice,
      _gasLimit: gasLimit
    });
  }

  async balanceOf(_holder) {
    const methodName = this.balanceOf.name;
    if (!this.contract || !this.contract.methods[methodName]) {
      throw Error(`No such method: ${methodName}`)
    }

    return await this.contract.methods[methodName](_holder).call();
  }

  async IsWhite(_account) {
    const methodName = this.IsWhite.name;
    if (!this.contract || !this.contract.methods[methodName]) {
      throw Error(`No such method: ${methodName}`)
    }

    return await this.contract.methods[methodName](_account).call();
  }

  async getPastEvents(_eventName) {
    return await this.contract.getPastEvents(
      _eventName,
      {
        fromBlock: 0,
        toBlock: 'latest'
      }
    );
  }

  async beneficiaryBought(_address) {
    const methodName = this.beneficiaryBought.name;
    if (!this.contract || !this.contract.methods[methodName]) {
      throw Error(`No such method: ${methodName}`)
    }

    return await this.contract.methods[methodName](_address).call();
  }
}

module.exports = EthContract;
