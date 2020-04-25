[![Build Status](https://travis-ci.org/fivdi/lcd.svg?branch=master)](https://travis-ci.org/fivdi/lcd)
[![npm Version](http://img.shields.io/npm/v/lcd.svg)](https://www.npmjs.com/package/lcd)
[![Downloads Per Month](http://img.shields.io/npm/dm/lcd.svg)](https://www.npmjs.com/package/lcd)

## lcd

A **Node.js** Hitachi HD44780 LCD driver for Linux boards like the Raspberry Pi
Zero, 1, 2, or 3, BeagleBone, or BeagleBone Black. Heavily inspired by the
Arduino
[LiquidCrystal library](http://arduino.cc/en/Tutorial/LiquidCrystal).

Most LCDs compatible with the HD44780 have a sixteen pin interface. This
Node.js module uses six of these interface pins for controlling such displays.
Register select (RS), enable (E), and four data bus pins (D4-D7). The
read/write (R/W) pin is assumed to be tied low to permanently select write
mode.

lcd supports Node.js versions 8, 10, 12, 13 and 14.

## Installation

```
npm install lcd
```

## Usage

The following program can be used to make a UTC digital clock.

```js
const Lcd = require('lcd');
const lcd = new Lcd({rs: 45, e: 44, data: [66, 67, 68, 69], cols: 8, rows: 1});

lcd.on('ready', _ => {
  setInterval(_ => {
    lcd.setCursor(0, 0);
    lcd.print(new Date().toISOString().substring(11, 19), err => {
      if (err) {
        throw err;
      }
    });
  }, 1000);
});

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', _ => {
  lcd.close();
  process.exit();
});
```

Here it is up and running on a BeagleBone Black wired up to an 8x1 display:

<img src="https://github.com/fivdi/lcd/raw/master/example/digital-clock-8x1.jpg">

After requiring the lcd module, the above program creates an Lcd object. The
constructor function is passed all the necessary information.

The six LCD interface pins used to control the display need to be wired up to
six GPIOs on the BeagleBone Black. GPIOs on Linux are identified by unsigned
integers. The relevant information for all six GPIOs used here is shown in the
following table:

BBB Expansion Header | GPIO No. | LCD Function | LCD Pin No.
:---: | :---: | :---: | :---:
P8_7 | 66 | Data Bus Bit 4 | 11
P8_8 | 67 | Data Bus Bit 5 | 12
P8_10 | 68 | Data Bus Bit 6 | 13
P8_9 | 69 | Data Bus Bit 7 | 14
P8_11 | 45 | Register Select |  4
P8_12 | 44 | Enable  |  6

The constructor function is also told how many columns and rows the display
has, eight and one respectively in this case.

It takes several milliseconds to initialize an LCD. The constructor starts the
initialization process, but it doesn't wait for it to complete. Instead,
a 'ready' event is emitted after the LCD has been completely initialized and is
ready for usage.

The 'ready' handler leverages setInterval to execute a function that updates
the time displayed on the LCD once a second.

## API

**Lcd(config)**

Returns a new Lcd object which inherits from EventEmitter. A 'ready' event will
be emitted when the display is ready for usage.

The config object has these possibilities:

 * **cols** LCD column count. Defaults to 16.
 * **rows** LCD row count. Defaults to 1.
 * **largeFont** Use 5x10 dot font. Defaults to false for 5x8 dot font.
 * **rs** Register select GPIO number.
 * **e** Enable GPIO number.
 * **data** Array of four GPIO numbers for data bus bits D4 through D7.

**print(val, [callback])**

Converts val to string and writes it to the display **asynchronously**.

If the optional completion callback is omitted, a 'printed' event is emitted
after the operation has completed. The string representation of val is passed
to the 'printed' event handler as the first argument. If an error occurs, an
'error' event will be emitted and an error object will be passed to the
'error' event handler as the first argument.

If the optional completion callback is specified, it gets two arguments
(err, str), where err is reserved for an error object and str is the string
representation of val. If the optional completion callback is specified, no
'printed' or 'error' event will be emitted.

The example print-twice-20x4.js demonstrates how to print two strings in
succession.

**clear([callback])**

Clears display and returns cursor to the home position **asynchronously**.

If the optional completion callback is omitted, a 'clear' event is emitted
after the operation has completed. If an error occurs, an 'error' event will
be emitted and an error object will be passed to the 'error' event handler
as the first argument.

If the optional completion callback is specified, it gets one argument (err),
where err is reserved for an error object. If the optional completion callback
is specified, no 'clear' or 'error' event will be emitted.

**home([callback])**

Returns cursor to home position **asynchronously**. Also returns display being
shifted to the original position.

If the optional completion callback is omitted, a 'home' event is emitted
after the operation has completed. If an error occurs, an 'error' event will
be emitted and an error object will be passed to the 'error' event handler
as the first argument.

If the optional completion callback is specified, it gets one argument (err),
where err is reserved for an error object. If the optional completion callback
is specified, no 'home' or 'error' event will be emitted.

**setCursor(col, row)** Moves the cursor to the specified col and row.
Numbering for col and row starts at zero.

**cursor()** Turn cursor on.

**noCursor()** Turn cursor off.

**blink()** Turn cursor blink on.

**noBlink()** Turn cursor blink off.

**scrollDisplayLeft()** Shift display to the left. Cursor follows the display
shift.

**scrollDisplayRight()** Shift display to the right. Cursor follows the display
shift.

**leftToRight()** Sets cursor move direction to left to right.

**rightToLeft()** Sets cursor move direction to right to left.

**autoscroll()** Automatically shift display when data is written to display.

**noAutoscroll()** Turn automatic shifting off.

**close()** Frees (unexports) all GPIOs used by the Lcd.

## Example "Hello, World!" on an 8x1 display

"Hello, World!" is five characters too long for an 8x1 display, but by moving
the cursor to the ninth column, turning autoscroll on, and displaying a new
character every 300 milliseconds the text can be scrolled onto the display
character by character. Note that an 8x1 display actually has eighty columns
but only eight of them are visible.

```js
const Lcd = require('../lcd');
const lcd = new Lcd({rs: 45, e: 44, data: [66, 67, 68, 69], cols: 8, rows: 1});

const print = (str, pos) => {
  pos = pos || 0;

  if (pos === str.length) {
    pos = 0;
  }

  lcd.print(str[pos], err => {
    if (err) {
      throw err;
    }

    setTimeout(_ => {
      print(str, pos + 1);
    }, 300);
  });
};

lcd.on('ready', _ => {
  lcd.setCursor(8, 0);
  lcd.autoscroll();
  print('Hello, World! ** ');
});

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', _ => {
  lcd.close();
  process.exit();
});
```

## Tested with the following displays

[NHD-0108FZ-FL-YBW-33V3](http://www.newhavendisplay.com/nhd0108fzflybw33v3-p-5155.html)

[NHD-0420DZ-FL-YBW-33V3](http://www.newhavendisplay.com/nhd0420dzflybw33v3-p-5168.html)

