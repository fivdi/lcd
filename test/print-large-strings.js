'use strict';

/**
 * The Lcd print method is optimized not to display charachters that will be
 * overwritten. The tests below verify that this optimization functions
 * correctly.
 */
const Lcd = require('../lcd');
const lcd = new Lcd({rs: 23, e: 24, data: [17, 18, 22, 27], cols: 20, rows: 4});

const delay = time => new Promise(resolve => setTimeout(resolve, time));

lcd.on('ready', _ => {
  Promise.resolve()
  .then(_ => lcd.print('abc')) // 'abc'
  .then(_ => delay(1000))
  .then(_ => lcd.print(new Array(81).join('.') + 'abc')) // '...abc..'
  .then(_ => delay(1000))
  .then(_ => {
    lcd.setCursor(0, 0);
    lcd.print(new Array(801).join('+') + 'abc'); // 'abc+++++'
  })
  .then(_ => delay(1000))
  .then(_ => {
    lcd.setCursor(0, 0);
    lcd.print(new Array(800001).join('*') + '<Hello>'); // '<Hello>*'
  })
  .then(_ => delay(1000))
  .then(_ => {
    lcd.setCursor(8, 0);
    lcd.autoscroll();
    lcd.print(new Array(801).join('+') + 'abc'); // '+++++abc'
  });
});

