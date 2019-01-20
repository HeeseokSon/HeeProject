'use strict';

const assert = require('assert');
const utils = require('../utils');

suite('Ethereum Test', function(){
    suite('Utils-String', function(){
        var Tool;
        setup(function(){
            Tool = require('../stringtools');
        });

        teardown(function(){
        
        });
        test('Nomal Number convert 8 Decimal String',function(){
            //소수점 위치 반환          
            assert.equal( Tool.getDotIndex('1.0'), 1, 'get Dot Index 1');
            assert.equal( Tool.getDotIndex('1.20'), 1, 'get Dot Index 1');
            assert.equal( Tool.getDotIndex('12.20'), 2, 'get Dot Index 2');
            assert.equal( Tool.getDotIndex('0'), -1, 'get Dot Index -1');
            //소수점 없는 문자열 변환
            assert.equal( Tool.getDecimal('1',18),'1000000000000000000', '1' );
            assert.equal( Tool.getDecimal('10',18),'10000000000000000000', '10');
            assert.equal( Tool.getDecimal('102',18),'102000000000000000000', '102' );
            //소수점 아래 문자열 변환
            assert.equal( Tool.getDotUnder('1.121',1,18),'121000000000000000' );
            //소수점 위 문자열 변환
            assert.equal( Tool.getDotUpper('1.121',1,18),'1');
            assert.equal( Tool.getDecimal('1.0',18),'1000000000000000000' );
            assert.equal( Tool.getDecimal('12.0',18),'12000000000000000000' );
            assert.equal( Tool.getDecimal('12212.0',18),'12212000000000000000000' );
            assert.equal( Tool.getDecimal('12212.012345678901234567890',18),'12212012345678901234567' );
        });

        test('Nomal Number convert 8 Decimal String',function(){
            assert.equal( Tool.getDecimal('12212.0',8),'1221200000000' );
            assert.equal( Tool.getDecimal('12212.23',8),'1221223000000' );
            assert.equal( Tool.getDecimal('12212',8),'1221200000000' );
            assert.equal( Tool.getDecimal('0',8),'00000000' );
        })

        test('Decimal 18 convert Nomal Number String', function(){
            assert.equal( Tool.getNomalNumber('000000000000000000',18),'0' );
            assert.equal( Tool.getNomalNumber('000000000000000001',18),'0.000000000000000001' );
            assert.equal( Tool.getNomalNumber('000000000000000010',18),'0.00000000000000001' );
            assert.equal( Tool.getNomalNumber('1000000000000000010',18),'1.00000000000000001' );
            assert.equal( Tool.getNomalNumber('11000000000000000010',18),'11.00000000000000001' );
            assert.equal( Tool.getNomalNumber('1133000000000000010000',18),'1133.00000000000001' );
            assert.equal( Tool.getNomalNumber('1133100000000000000000',18),'1133.1' );
        })

        test('Decimal 8 convert Nomal Number String', function(){
            assert.equal( Tool.getNomalNumber('00000000',8 ), 0 );
            assert.equal( Tool.getNomalNumber('00000001',8 ),'0.00000001' );
            assert.equal( Tool.getNomalNumber('100000001',8 ),'1.00000001' );
        })
    });
    suite('Test DB', function(){
        test('connect', function(){
            utils.asyncDBList()
            .then( results => {
                assert( results.lenth, 1 );
            } )
            .catch( err => {
                assert.ifError( err );
            })
        })
    })
})