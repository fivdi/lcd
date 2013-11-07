## lcd

A Node.js Hitachi HD44780 LCD driver for Linux boards such as the BeagleBone or
Raspberry Pi. Heavily inspired by the Arduino
[LiquidCrystal library](http://arduino.cc/en/Tutorial/LiquidCrystal).

LCDs compatible with the HD44780 have a sixteen pin interface. This Node.js
module uses six of these interface pins for controlling such displays.
Register select (RS), enable (E), and four data bus pins (D4-D7). The
read/write (R/W) pin is assumed to be tied low to permanently select write
mode.

## Installation

    $ [sudo] npm install lcd

lcd requires Node.js v0.8.0 or higher.

## Usage

The following nine line program can be used to make a digital clock.

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

Here it is up and running on a BeagleBone Black wired up to an 8 x 1 display:

<img src="https://github.com/fivdi/lcd/raw/master/example/digital-clock-8x1.jpg">

After requiring the lcd module, the above program creates an Lcd object. The
constructor function is passed all the necessary information.

The six LCD interface pins used to control the display need to be wired up to
six GPIOs on the BeagleBone Black. GPIOs on Linux are identified by unsigned
integers. The relevant information for all six GPIOs used here is shown in the
following table:

BBB Expansion Header | GPIO No. | Function | LCD Pin No.
:---: | :---: | :---: | ---:
P8_13 | 23 | D4 | 11
P8_14 | 26 | D5 | 12
P8_15 | 47 | D7 | 14
P8_16 | 46 | D6 | 13
P8_17 | 27 | RS |  4
P8_18 | 65 | E  |  6

The constructor function is also told how many columns and rows the display
has, eight and one respectively in this case.

It takes several milliseconds to initialize an LCD. The constructor starts the
initialization process, but it doesn't wait around for it to complete. Instead,
a 'ready' event is fired after the LCD has been completely initialized and is
ready for usage.

The 'ready' handler leverages setInterval to execute a function that updates
the time displayed on the LCD once a second.

Adding the following few lines will turn the digital clock into a good citizen
that cleans up after itself.

```js
// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function () {
  lcd.close();
  process.exit();
});
```

## API

API documentation will be added here asap.

