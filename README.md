## lcd

A Node.js Hitachi HD44780 LCD driver for Linux boards such as the BeagleBone or
Raspberry Pi.

## Installation

    $ [sudo] npm install lcd

lcd requires Node.js v0.8.0 or higher.

## Usage

A 9-line digital clock ...

```js
var Lcd = require('lcd'),
  lcd = new Lcd({rs:27, e:65, data:[23, 26, 46, 47], cols:8, rows:1});

lcd.on('ready', function () {
  setInterval(function () {
    lcd.setCursor(0, 0);
    lcd.print(new Date().toISOString().substring(11, 19));
  }, 1000);
});
```

... up and running on a BeagleBone Black:

<img src="https://github.com/fivdi/lcd/raw/master/example/digital-clock-8x1.jpg">

## API

API documentation will be added here asap.

