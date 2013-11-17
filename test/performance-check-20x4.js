/*
 * Fill the display with each character and determine how often the display
 * can be filled per second.
 */
var Lcd = require('../lcd'),
  lcd = new Lcd({rs:45, e:44, data:[66, 67, 68, 69], cols:20, rows:4}), // BBB
  // lcd = new Lcd({rs:23, e:24, data:[17, 18, 22, 27], cols:20, rows:4}), // Pi
  time;

lcd.on('ready', function () {
  time = process.hrtime();
  fillDisplay(0);
});

function fillDisplay(charCode) {
  lcd.print(Array(20 * 4 + 1).join(String.fromCharCode(charCode)));

  process.nextTick(function () {
    var fillsPerSec;

    charCode += 1;
    if (charCode < 256) {
      fillDisplay(charCode);
    } else {
      time = process.hrtime(time);
      fillsPerSec  = Math.floor(256 / (time[0] + time[1] / 1E9));
      console.log(fillsPerSec + ' display fills per second');
      lcd.close();
    }
  });
}

