'use strict';

const Lcd = require('../lcd');
const lcd = new Lcd({rs: 45, e: 44, data: [66, 67, 68, 69], cols: 8, rows: 1});

lcd.on('ready', () => {
  setInterval(() => {
    lcd.setCursor(0, 0);
    lcd.print(new Date().toISOString().substring(11, 19), (err) => {
      if (err) {
        throw err;
      }
    });
  }, 1000);
});

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', () => {
  lcd.close();
  process.exit();
});

