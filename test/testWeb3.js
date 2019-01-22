'use strict';

const assert = require('assert');
var web3;
const provider = "https://mainnet.infura.io/v3/8026d39539c54131b5f882757d6fd677"

suite('Web3', function(){
    var Web3 = require('web3');
    suite('Utils Test', function(){

        setup(function(){
            web3 = new Web3( new Web3.providers.HttpProvider(provider) );
            console.log( web3.eth.getBalance('0x6d09e2E2537Aa46f70628109E855C3000f114cf6') );
        });
        teardown(function(){
        });
        test('BN test', function(){
            assert.equal( '1', '2', '3');
        });
    });
});
