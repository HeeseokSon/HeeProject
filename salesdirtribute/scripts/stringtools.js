"use strict";

function StringTools() {
}

StringTools.prototype.getDotIndex = function(str){
    return  str.indexOf('.');
}

StringTools.prototype.getDecimal = function(str,dec){
    var index = this.getDotIndex(str);

    if ( index == -1 ) {
        if ( parseFloat( str ) == 0 ) {
            return this.fillZero( dec );
        } else {
            return str + this.fillZero( dec );;
        }
    }else {
        return this.getDotUpper(str, index,dec) + this.getDotUnder(str,index,dec);//'1000210000000000000000'
    }
}

StringTools.prototype.fillZero = function(count) {
    var fillstr = '';

    for (var i = 0; i <= count - 1; i++) {
        fillstr = fillstr + '0';
    }     

    return fillstr;
}

StringTools.prototype.getDotUnder = function(str, index,dec){
    var result = str.slice( index + 1, str.length);
    var fillcount = dec - result.length;

    if (fillcount < 0) { 
        return result = result.slice(0,dec);
    }else {
        var fillstr = this.fillZero(fillcount);
        return result + fillstr;
    }
}

StringTools.prototype.getDotUpper = function(str,index,dec){
    return str.slice(0,index);
}

StringTools.prototype.getNomalNumber = function(str,dec) {
    var length = str.length;
    var result;

    if (length > dec) {
        var index = length - dec;

        result = str.slice(0, index ) + '.' + str.slice( index, length );
        return parseFloat( result );
    } else if (length == dec) {
        result = str;
        return parseFloat( '0.' + result );
    } else {
        return parseFloat( str );
    }
}

module.exports = new StringTools();