'use strict';

/**
 * The clear, home, and print methods are asynchronous. Internally the lcd
 * module queues calls to clear, home, and print and executes them
 * sequentially.
 */

const Lcd = require('../lcd');
const lcd = new Lcd({rs: 23, e: 24, data: [17, 18, 22, 27], cols: 20, rows: 4});

lcd.on('ready', () => {
  let prints = 0;

  const linePrinted = () => {
    prints += 1;
    if (prints === 256) {
      lcd.close();
    }
  };

  for (let charCode = 0; charCode !== 256; charCode += 1) {
    lcd.clear();
    lcd.home();
    lcd.print(
      new Array(20 * 4 + 1).join(String.fromCharCode(charCode)),
      linePrinted
    );
  }
});

