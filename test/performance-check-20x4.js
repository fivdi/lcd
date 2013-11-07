var Lcd = require('./lcd'),
  lcd = new Lcd({rs:45, e:44, data:[66, 67, 68, 69], cols:20, rows:4});

lcd.on('ready', function () {
  fillDisplay(0);
});

function fillDisplay(charCode) {
  lcd.print(Array(20 * 4 + 1).join(String.fromCharCode(charCode)));

  setTimeout(function () {
    print((charCode + 1) % 256)
  }, 250);
}

