'use strict';

const Lcd = require('../lcd');
const lcd = new Lcd({rs: 45, e: 44, data: [66, 67, 68, 69], cols: 8, rows: 1});

const print = (str, pos) => {
  pos = pos || 0;

  if (pos === str.length) {
    pos = 0;
  }

  lcd.print(str[pos], (err) => {
    if (err) {
      throw err;
    }

    setTimeout(() => {
      print(str, pos + 1);
    }, 300);
  });
};

lcd.on('ready', () => {
  lcd.setCursor(8, 0);
  lcd.autoscroll();
  print('Hello, World! ** ');
});

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', () => {
  lcd.close();
  process.exit();
});

