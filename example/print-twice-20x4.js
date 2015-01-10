'use strict';

// This example demonstrates how to call print twice in succession to display
// two strings at different positions on the LCD.
var Lcd = require('../lcd'),
  lcd = new Lcd({rs: 23, e: 24, data: [17, 18, 22, 27], cols: 20, rows: 4});// Pi

lcd.on('ready', function () {
  lcd.setCursor(0, 0);                                    // col 0, row 0
  lcd.print(new Date().toISOString().substring(11, 19));  // print time
  lcd.once('printed', function () {
    lcd.setCursor(0, 1);                                  // col 0, row 1
    lcd.print(new Date().toISOString().substring(0, 10)); // print date
    lcd.once('printed', function () {
      lcd.close();
    });
  });
});

