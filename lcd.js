'use strict';

const EventEmitter = require('events').EventEmitter;
const Gpio = require('onoff').Gpio;
const mutexify = require('mutexify');

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

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const sleepus = (usDelay) => {
  let startTime = process.hrtime();
  let deltaTime;
  let usWaited = 0;

  while (usDelay > usWaited) {
    deltaTime = process.hrtime(startTime);
    usWaited = (deltaTime[0] * 1E9 + deltaTime[1]) / 1000;
  }
};

class Lcd extends EventEmitter {
  constructor(config) {
    super();

    this.cols = config.cols || 16; // TODO - Never used, remove?
    this.rows = config.rows || 1;
    this.largeFont = !!config.largeFont;

    this.rs = new Gpio(config.rs, 'low'); // reg. select, output, initially low
    this.e = new Gpio(config.e, 'low'); // enable, output, initially low
    this.data = config.data.map(gpioNo => new Gpio(gpioNo, 'low'));

    this.displayControl = 0x0c; // display on, cursor off, cursor blink off
    this.displayMode = 0x06; // left to right, no shift

    this.lock = mutexify();

    this._init();
  }

  _init() {
    delay(16)                           // wait > 15ms
    .then(() => this._write4Bits(0x03)) // 1st wake up
    .then(() => delay(6))               // wait > 4.1ms
    .then(() => this._write4Bits(0x03)) // 2nd wake up
    .then(() => delay(2))               // wait > 160us
    .then(() => this._write4Bits(0x03)) // 3rd wake up
    .then(() => delay(2))               // wait > 160us
    .then(() => {
      let displayFunction = 0x20;

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
      return delay(3);     // wait > 1.52ms for display to clear
    })
    .then(() => this.emit('ready'));
  }

  print(val, cb) {
    this.lock((release) => {
      val += '';

      // If n*80+m characters should be printed, where n>1, m<80, don't
      // display the first (n-1)*80 characters as they will be overwritten.
      // For example, if asked to print 802 characters, don't display the
      // first 720.
      const displayFills = Math.floor(val.length / 80);
      const index = displayFills > 1 ? (displayFills - 1) * 80 : 0;

      this._printChar(val, index, release, cb);
    });
  }

  _printChar(str, index, release, cb) {
    setImmediate(() => {
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
    });
  }

  clear(cb) {
    // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
    this._commandAndDelay(COMMANDS.CLEAR_DISPLAY, 3, 'clear', cb);
  }

  home(cb) {
    // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
    this._commandAndDelay(COMMANDS.HOME, 3, 'home', cb);
  }

  setCursor(col, row) {
    const r = row > this.rows ? this.rows - 1 : row;
    // TODO: throw error instead? Seems like this could cause a silent bug.
    // we don't check for column because scrolling is a possibility. Should
    // we check if it's in range if scrolling is off?
    this._command(COMMANDS.SET_CURSOR | (col + ROW_OFFSETS[r]));
  }

  display() {
    this.displayControl |= COMMANDS.DISPLAY_ON;
    this._command(this.displayControl);
  }

  noDisplay() {
    this.displayControl &= COMMANDS.DISPLAY_OFF;
    this._command(this.displayControl);
  }

  cursor() {
    this.displayControl |= COMMANDS.CURSOR_ON;
    this._command(this.displayControl);
  }

  noCursor() {
    this.displayControl &= COMMANDS.CURSOR_OFF;
    this._command(this.displayControl);
  }

  blink() {
    this.displayControl |= COMMANDS.BLINK_ON;
    this._command(this.displayControl);
  }

  noBlink() {
    this.displayControl &= COMMANDS.BLINK_OFF;
    this._command(this.displayControl);
  }

  scrollDisplayLeft() {
    this._command(COMMANDS.SCROLL_LEFT);
  }

  scrollDisplayRight() {
    this._command(COMMANDS.SCROLL_RIGHT);
  }

  leftToRight() {
    this.displayMode |= COMMANDS.LEFT_TO_RIGHT;
    this._command(this.displayMode);
  }

  rightToLeft() {
    this.displayMode &= COMMANDS.RIGHT_TO_LEFT;
    this._command(this.displayMode);
  }

  autoscroll() {
    this.displayMode |= COMMANDS.AUTOSCROLL_ON;
    this._command(this.displayMode);
  }

  noAutoscroll() {
    this.displayMode &= COMMANDS.AUTOSCROLL_OFF;
    this._command(this.displayMode);
  }

  close() {
    this.rs.unexport();
    this.e.unexport();
    this.data.forEach(gpio => gpio.unexport());
  }

  _commandAndDelay(command, timeout, event, cb) {
    this.lock((release) => {
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

      setTimeout(() => {
        if (cb) {
          cb(null);
        } else {
          this.emit(event);
        }

        release();
      }, timeout);
    });
  }

  _command(cmd) {
    // Maximum execution time
    // HD44780                | 37us
    // ST7066U                | 37us
    // NHD-0420DZ-FL-YBW-33V3 | 39us
    this._send(cmd, 0);
    sleepus(39);
  }

  _write(val) {
    // Maximum execution time
    // HD44780                | 37us
    // ST7066U                | 37us
    // NHD-0420DZ-FL-YBW-33V3 | 43us
    this._send(val, 1);
    sleepus(43);
  }

  _send(val, mode) {
    this.rs.writeSync(mode);
    this._write4Bits(val >> 4);
    this._write4Bits(val);
  }

  _write4Bits(val) {
    if(!(typeof val === 'number')) {
      throw new Error("Value passed to ._write4Bits must be a number");
    }

    //                                         | HD44780 | ST7066U | Unit |
    // Minium enable cycle time                |    1000 |    1200 |   ns |
    // Minimum enable pulse width (high level) |     450 |     460 |   ns |
    this.e.writeSync(1);
    this.data.forEach((gpio, i) => gpio.writeSync((val >> i) & 1));
    this.e.writeSync(0);
    sleepus(1);
  }
}

module.exports = Lcd;

