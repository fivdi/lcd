'use strict';

/**
 * Call asynchronous print twice in succession to print a total of 78
 * characters. The output from the two calls should be interlaced as print
 * is asynchronous.
 */
var Lcd = require('../lcd'),
  //lcd = new Lcd({rs: 45, e: 44, data: [66, 67, 68, 69], cols: 20, rows: 4}),// BBB
  //lcd = new Lcd({rs: 27, e: 65, data: [23, 26, 46, 47], cols: 8, rows: 1}),// BBB
  lcd = new Lcd({rs: 23, e: 24, data: [17, 18, 22, 27], cols: 20, rows: 4}),// Pi
  printed = 0;

lcd.on('ready', function () {
  lcd.print(new Array(40).join('a'));
  lcd.print(new Array(40).join('b'));
});

lcd.on('printed', function () {
  printed += 1;

  if (printed === 2) {
    lcd.close();
  }
});

