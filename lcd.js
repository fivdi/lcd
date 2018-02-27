'use strict';

const EventEmitter = require('events').EventEmitter,
  Gpio = require('onoff').Gpio,
  mutexify = require('mutexify'),
  Q = require('q'),
  util = require('util');

const ROW_OFFSETS = [0x00, 0x40, 0x14, 0x54];

const COMMANDS = {
  CLEAR_DISPLAY: 0x01,
  HOME: 0x02,
  SET_CURSOR: 0x80,
  DISPLAY_ON: 0x04,
  DISPLAY_OFF: ~0x04,
  CURSOR_ON: 0x02,
  CURSOR_OFF: ~0x02,
  BLINK_ON: 0x01,
  BLINK_OFF: ~0x01,
  SCROLL_LEFT: 0x18,
  SCROLL_RIGHT: 0x1c,
  LEFT_TO_RIGHT: 0x02,
  RIGHT_TO_LEFT: ~0x02,
  AUTOSCROLL_ON: 0x01,
  AUTOSCROLL_OFF: ~0x01
};

function Lcd(config) {
  if (!(this instanceof Lcd)) {
    return new Lcd(config);
  }

  EventEmitter.call(this);

  this.cols = config.cols || 16; // TODO - Never used, remove?
  this.rows = config.rows || 1;
  this.largeFont = !!config.largeFont;

  this.rs = new Gpio(config.rs, 'low'); // reg. select, output, initially low
  this.e = new Gpio(config.e, 'low'); // enable, output, initially low
  this.data = config.data.map(gpioNo => new Gpio(gpioNo, 'low'));

  this.displayControl = 0x0c; // display on, cursor off, cursor blink off
  this.displayMode = 0x06; // left to right, no shift

  this.lock = mutexify();

  this.init();
}

util.inherits(Lcd, EventEmitter);
module.exports = Lcd;

// private
Lcd.prototype.init = function () {
  Q.delay(16)                                               // wait > 15ms
  .then(function () { this._write4Bits(0x03); }.bind(this)) // 1st wake up
  .delay(6)                                                 // wait > 4.1ms
  .then(function () { this._write4Bits(0x03); }.bind(this)) // 2nd wake up
  .delay(2)                                                 // wait > 160us
  .then(function () { this._write4Bits(0x03); }.bind(this)) // 3rd wake up
  .delay(2)                                                 // wait > 160us
  .then(function () {
    var displayFunction = 0x20;

    this._write4Bits(0x02); // 4 bit interface

    if (this.rows > 1) {
      displayFunction |= 0x08;
    }
    if (this.rows === 1 && this.largeFont) {
      displayFunction |= 0x04;
    }
    this._command(displayFunction);

    this._command(0x10);
    this._command(this.displayControl);
    this._command(this.displayMode);

    this._command(0x01); // clear display (don't call clear to avoid event)
  }.bind(this))
  .delay(3)             // wait > 1.52ms for display to clear
  .then(function () { this.emit('ready'); }.bind(this));
};

Lcd.prototype.print = function (val, cb) {
  this.lock(function (release) {
    val += '';

    // If n*80+m characters should be printed, where n>1, m<80, don't display the
    // first (n-1)*80 characters as they will be overwritten. For example, if
    // asked to print 802 characters, don't display the first 720.
    const displayFills = Math.floor(val.length / 80);
    const index = displayFills > 1 ? (displayFills - 1) * 80 : 0;

    this._printChar(val, index, release, cb);
  }.bind(this));
};

// private
Lcd.prototype._printChar = function (str, index, release, cb) {
  setImmediate(function () {
    if (index >= str.length) {
      if (cb) {
        cb(null, str);
      } else {
        this.emit('printed', str);
      }

      return release();
    }

    try {
      this._write(str.charCodeAt(index));
      this._printChar(str, index + 1, release, cb);
    } catch (e) {
      if (cb) {
        cb(e);
      } else {
        this.emit('error', e);
      }

      release();
    }
  }.bind(this));
};

Lcd.prototype.clear = function (cb) {
  // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
  this._commandAndDelay(COMMANDS.CLEAR_DISPLAY, 3, 'clear', cb);
};

Lcd.prototype.home = function (cb) {
  // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
  this._commandAndDelay(COMMANDS.HOME, 3, 'home', cb);
};

Lcd.prototype.setCursor = function (col, row) {
  const r = row > this.rows ? this.rows - 1 : row; //TODO: throw error instead? Seems like this could cause a silent bug.
  //we don't check for column because scrolling is a possibility. Should we check if it's in range if scrolling is off?
  this._command(COMMANDS.SET_CURSOR | (col + ROW_OFFSETS[r]));
};

Lcd.prototype.display = function () {
  this.displayControl |= COMMANDS.DISPLAY_ON;
  this._command(this.displayControl);
};

Lcd.prototype.noDisplay = function () {
  this.displayControl &= COMMANDS.DISPLAY_OFF;
  this._command(this.displayControl);
};

Lcd.prototype.cursor = function () {
  this.displayControl |= COMMANDS.CURSOR_ON;
  this._command(this.displayControl);
};

Lcd.prototype.noCursor = function () {
  this.displayControl &= COMMANDS.CURSOR_OFF;
  this._command(this.displayControl);
};

Lcd.prototype.blink = function () {
  this.displayControl |= COMMANDS.BLINK_ON;
  this._command(this.displayControl);
};

Lcd.prototype.noBlink = function () {
  this.displayControl &= COMMANDS.BLINK_OFF;
  this._command(this.displayControl);
};

Lcd.prototype.scrollDisplayLeft = function () {
  this._command(COMMANDS.SCROLL_LEFT);
};

Lcd.prototype.scrollDisplayRight = function () {
  this._command(COMMANDS.SCROLL_RIGHT);
};

Lcd.prototype.leftToRight = function () {
  this.displayMode |= COMMANDS.LEFT_TO_RIGHT;
  this._command(this.displayMode);
};

Lcd.prototype.rightToLeft = function () {
  this.displayMode &= COMMANDS.RIGHT_TO_LEFT;
  this._command(this.displayMode);
};

Lcd.prototype.autoscroll = function () {
  this.displayMode |= COMMANDS.AUTOSCROLL_ON;
  this._command(this.displayMode);
};

Lcd.prototype.noAutoscroll = function () {
  this.displayMode &= COMMANDS.AUTOSCROLL_OFF;
  this._command(this.displayMode);
};

Lcd.prototype.close = function () {
  this.rs.unexport();
  this.e.unexport();
  this.data.forEach(gpio => gpio.unexport());
};

// private
Lcd.prototype._commandAndDelay = function (command, timeout, event, cb) {
  this.lock(function (release) {
    try {
      this._command(command);
    } catch (e) {
      if (cb) {
        cb(e);
      } else {
        this.emit('error', e);
      }

      return release();
    }

    setTimeout(function () {
      if (cb) {
        cb(null);
      } else {
        this.emit(event);
      }

      release();
    }.bind(this), timeout);
  }.bind(this));
};

// private
Lcd.prototype._command = function (cmd) {
  this._send(cmd, 0);
};

// private
Lcd.prototype._write = function (val) {
  this._send(val, 1);
};

// private
Lcd.prototype._send = function (val, mode) {
  this.rs.writeSync(mode);
  this._write4Bits(val >> 4);
  this._write4Bits(val);
};

// private
Lcd.prototype._write4Bits = function (val) {
  if(!(typeof val === 'number')){
    throw new Error("Value passed to ._write4Bits must be a number");
  }

  var i;

  for (i = 0; i < this.data.length; i += 1, val = val >> 1) {
    this.data[i].writeSync(val & 1);
  }

  // enable pulse >= 300ns
  this.e.writeSync(1);
  this.e.writeSync(0);
};

