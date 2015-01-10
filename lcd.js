'use strict';

var EventEmitter = require('events').EventEmitter,
  Gpio = require('onoff').Gpio,
  Q = require('q'),
  util = require('util'),
  tick = global.setImmediate || process.nextTick;

var ROW_OFFSETS = [0x00, 0x40, 0x14, 0x54];

// TODO - Don't use magic numbers, define constants instead.

function Lcd(config) {
  var i;

  if (!(this instanceof Lcd)) {
    return new Lcd(config);
  }

  EventEmitter.call(this);

  this.cols = config.cols || 16; // TODO - Never used, remove?
  this.rows = config.rows || 1;
  this.largeFont = !!config.largeFont;

  this.rs = new Gpio(config.rs, 'low'); // reg. select, output, initially low
  this.e = new Gpio(config.e, 'low'); // enable, output, initially low

  this.data = []; // data bus, db4 thru db7, outputs, initially low
  for (i = 0; i < config.data.length; i += 1) {
    this.data.push(new Gpio(config.data[i], 'low'));
  }

  this.displayControl = 0x0c; // display on, cursor off, cursor blink off
  this.displayMode = 0x06; // left to right, no shift

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
  var pos,
    displayFills;

  val += '';

  // If n*80+m characters should be printed, where n>1, m<80, don't display the
  // first (n-1)*80 characters as they will be overwritten. For example, if
  // asked to print 802 characters, don't display the first 720.
  displayFills = Math.floor(val.length / 80);
  pos = displayFills > 1 ? (displayFills - 1) * 80 : 0;

  this._printAsync(val, pos, cb);
};

// private
Lcd.prototype._printAsync = function (val, pos, cb) {
  tick(function () {
    if (pos >= val.length) {
      if (cb) {
        return cb(null);
      }

      return this.emit('printed', val);
    }

    try {
      this._write(val.charCodeAt(pos));
      this._printAsync(val, pos + 1, cb);
    } catch (e) {
      if (cb) {
        cb(e);
      } else {
        this.emit('error', e);
      }
    }
  }.bind(this));
};

Lcd.prototype.clear = function (cb) {
  // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
  this._commandAndDelay(0x01, 3, 'clear', cb);
};

Lcd.prototype.home = function (cb) {
  // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
  this._commandAndDelay(0x02, 3, 'home', cb);
};

Lcd.prototype.setCursor = function (col, row) {
  var r = row > this.rows ? this.rows - 1 : row;
  this._command(0x80 | (col + ROW_OFFSETS[r]));
};

Lcd.prototype.display = function () {
  this.displayControl |= 0x04;
  this._command(this.displayControl);
};

Lcd.prototype.noDisplay = function () {
  this.displayControl &= ~0x04;
  this._command(this.displayControl);
};

Lcd.prototype.cursor = function () {
  this.displayControl |= 0x02;
  this._command(this.displayControl);
};

Lcd.prototype.noCursor = function () {
  this.displayControl &= ~0x02;
  this._command(this.displayControl);
};

Lcd.prototype.blink = function () {
  this.displayControl |= 0x01;
  this._command(this.displayControl);
};

Lcd.prototype.noBlink = function () {
  this.displayControl &= ~0x01;
  this._command(this.displayControl);
};

Lcd.prototype.scrollDisplayLeft = function () {
  this._command(0x18);
};

Lcd.prototype.scrollDisplayRight = function () {
  this._command(0x1c);
};

Lcd.prototype.leftToRight = function () {
  this.displayMode |= 0x02;
  this._command(this.displayMode);
};

Lcd.prototype.rightToLeft = function () {
  this.displayMode &= ~0x02;
  this._command(this.displayMode);
};

Lcd.prototype.autoscroll = function () {
  this.displayMode |= 0x01;
  this._command(this.displayMode);
};

Lcd.prototype.noAutoscroll = function () {
  this.displayMode &= ~0x01;
  this._command(this.displayMode);
};

Lcd.prototype.close = function () {
  var i;

  this.rs.unexport();
  this.e.unexport();

  for (i = 0; i < this.data.length; i += 1) {
    this.data[i].unexport();
  }
};

// private
Lcd.prototype._commandAndDelay = function (command, timeout, event, cb) {
  tick(function () {
    try {
      this._command(command);

      setTimeout(function () {
        if (cb) {
          cb(null);
        } else {
          this.emit(event);
        }
      }.bind(this), timeout);
    } catch (e) {
      if (cb) {
        cb(e);
      } else {
        this.emit('error', e);
      }
    }
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
  var i;

  for (i = 0; i < this.data.length; i += 1, val = val >> 1) {
    this.data[i].writeSync(val & 1);
  }

  // enable pulse >= 300ns
  // writeSync takes ~10 microseconds to execute on the BBB, so there's
  // nothing special needed to wait 300 nanoseconds.
  this.e.writeSync(1);
  this.e.writeSync(0);
};

