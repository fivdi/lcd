'use strict';

/**
 * Call asynchronous print twice in succession to print a total of 78
 * characters. The output from the two calls should not be interlaced as print
 * calls are queued and executed sequentially.
 */
const Lcd = require('../lcd');
const lcd = new Lcd({rs: 23, e: 24, data: [17, 18, 22, 27], cols: 20, rows: 4});
let printed = 0;

lcd.on('ready', () => {
  lcd.print(new Array(40).join('a'));
  lcd.print(new Array(40).join('b'));
});

lcd.on('printed', () => {
  printed += 1;

  if (printed === 2) {
    lcd.close();
  }
});

