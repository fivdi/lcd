'use strict';

var Lcd = require('../lcd'),
  lcd = new Lcd({rs: 27, e: 65, data: [23, 26, 46, 47], cols: 8, rows: 1});

function print(str, pos) {
  pos = pos || 0;

  if (pos === str.length) {
    pos = 0;
  }

  lcd.print(str[pos]);

  setTimeout(function () {
    print(str, pos + 1);
  }, 300);
}

lcd.on('ready', function () {
  lcd.setCursor(8, 0);
  lcd.autoscroll();
  print('Hello, World! ** ');
});

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function () {
  lcd.close();
  process.exit();
});

