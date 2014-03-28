/**
 * The Lcd print method is optimized not to display charachters that will be
 * overwritten. The tests below verify that this optimization functions
 * correctly.
 */
var Lcd = require('../lcd'),
  Q = require('q'),
  lcd = new Lcd({rs:27, e:65, data:[23, 26, 46, 47], cols:8, rows:1});

lcd.on('ready', function () {
  Q.fcall(function () {
    lcd.print('abc'); // 'abc'
  })
  .delay(1000)
  .then(function () {
    lcd.print(Array(81).join('.') + 'abc'); // '...abc..'
  })
  .delay(1000)
  .then(function () {
    lcd.setCursor(0, 0);
    lcd.print(Array(801).join('+') + 'abc'); // 'abc+++++'
  })
  .delay(1000)
  .then(function () {
    lcd.setCursor(0, 0);
    lcd.print(Array(800001).join('*') + '<Hello>'); // '<Hello>*'
  })
  .delay(1000)
  .then(function () {
    lcd.setCursor(8, 0);
    lcd.autoscroll();
    lcd.print(Array(801).join('+') + 'abc'); // '+++++abc'
  });
});

