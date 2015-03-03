var assert = require('assert');
var sinon = require('sinon');
var Lcd = require('../lcd.js');

describe('write4bits tests', function(){

	var lcd, write4BitsSpy;

	before(function(){
		//Raspberry Pi Testing
		lcd = new Lcd({
			rs: 27,
			e: 22,
			data: [25, 24, 23, 18]
		});

		//TODO: Add BBB testing
	});

	beforeEach(function(){
		//write4BitsSpy = sinon.spy(lcd, '_write4Bits');
	})

	it('Throw an error if a value that is not a Number is passed', function(){
		assert.throws(function(){lcd._write4Bits('Hello');}, 'Value passed to ._write4Bits must be a number');
	});

	it('Throw an error if a Number greater than 16 is passed', function(){
		assert.throws(function(){lcd._write4Bits(0x11);}, 'value passed to ._write4Bits must be 16 or less');
	});

	after(function(){
		lcd.close();
	});
});