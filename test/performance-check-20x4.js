/*
 * Fill the display with each character and determine how often the display
 * can be filled per second.
 */
var Lcd = require('../lcd'),
  //lcd = new Lcd({rs:45, e:44, data:[66, 67, 68, 69], cols:20, rows:4}),// BBB
  lcd = new Lcd({rs:27, e:65, data:[23, 26, 46, 47], cols:8, rows:1}),// BBB
  //lcd = new Lcd({rs:23, e:24, data:[17, 18, 22, 27], cols:20, rows:4}),// Pi
  charCode = 0,
  time;

lcd.on('ready', function () {
  time = process.hrtime();
  fillDisplay(charCode);
});

lcd.on('printed', function (val) {
  charCode += 1;

  if (charCode < 256) {
    fillDisplay(charCode);
  } else {
    lcd.close();
    printResults();
  }
});

function fillDisplay(charCode) {
  lcd.print(Array(20 * 4 + 1).join(String.fromCharCode(charCode)));
}

function printResults() {
  var fillsPerSec;

  time = process.hrtime(time);
  fillsPerSec  = Math.floor(256 / (time[0] + time[1] / 1E9));
  console.log(fillsPerSec + ' display fills per second');
}

