'use strict';

var Lcd = require('../lcd'),
  lcd = new Lcd({rs: 27, e: 65, data: [23, 26, 46, 47], cols: 8, rows: 1});

lcd.on('ready', function () {
  setInterval(function () {
    lcd.setCursor(0, 0);
    lcd.print(new Date().toISOString().substring(11, 19));
  }, 1000);
});

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function () {
  lcd.close();
  process.exit();
});

