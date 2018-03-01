'use strict';

const async = require('async');
const Lcd = require('../lcd');
const lcd = new Lcd({rs: 23, e: 24, data: [17, 18, 22, 27], cols: 20, rows: 4});

lcd.on('ready', () => {
  async.series([
    (cb) => lcd.print(new Array(81).join(String.fromCharCode(255)), cb),
    (cb) => setTimeout(() => {
        lcd.clear(cb);
    }, 500),
    (cb) => lcd.print('12345678', cb),
    (cb) => lcd.home(cb),
    (cb) => lcd.print('ab', cb),
    (cb) => {
      lcd.setCursor(6, 0);
      lcd.print('cd', cb);
    }
  ], (err) => {
    if (err) {
      throw err;
    }

    lcd.close();
  });
});

