var EventEmitter = require('events').EventEmitter,
  Gpio = require('onoff').Gpio,
  Q = require('q'),
  util = require('util');

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
  for (i = 0; i < config.data.length; ++i) {
    this.data.push(new Gpio(config.data[i], 'low'));
  }

  this.displayControl = 0x0c; // display on, cursor off, cursor blink off
  this.displayMode = 0x06; // left to right, no shift

  this.init();
}

util.inherits(Lcd, EventEmitter);
module.exports = Lcd;

// private
Lcd.prototype.init = function init() {
  // TODO - This method doesn't look the best, improve it.
  // TODO - Findout out how precise delay/setTimeout are.
  Q.delay(15)                                            // wait > 15ms
  .then(function () {this.write4Bits(0x03);}.bind(this)) // 1st wake up
  .delay(5)                                              // wait > 4.1ms
  .then(function () {this.write4Bits(0x03);}.bind(this)) // 2nd wake up
  .delay(1)                                              // wait > 160us
  .then(function () {this.write4Bits(0x03);}.bind(this)) // 3rd wake up
  .delay(1)                                              // wait > 160us
  .then(function () {this.write4Bits(0x02);}.bind(this)) // 4 bit interface
  .then(function () {
    var displayFunction = 0x20;
    if (this.rows > 1) displayFunction |= 0x08;
    if (this.rows == 1 && this.largeFont) displayFunction |= 0x04;
    this.command(displayFunction);

    this.command(0x10);
    this.command(this.displayControl);
    this.command(this.displayMode);

    this.command(0x01); // clear display (don't call clear to avoid event)
  }.bind(this))
  .delay(3)             // wait 3ms for display to clear
  .then(function () {this.emit('ready')}.bind(this));
};

Lcd.prototype.print = function(val) {
  var pos,
    displayFills;

  val += '';

  // If n*80+m characters should be printed, where n>1, m<80, don't display the
  // first (n-1)*80 characters as they will be overwritten. For example, if
  // asked to print 802 characters, don't display the first 740.
  displayFills = Math.floor(val.length / 80);
  pos = displayFills > 1 ? (displayFills - 1) * 80 : 0;

  this.printNextBatch(val, pos);
};

// private
Lcd.prototype.printNextBatch = function(val, pos) {
  var endPos = Math.min(pos + 5, val.length);

  this.rs.writeSync(1);

  for (; pos != endPos; pos += 1) {
    this.write(val.charCodeAt(pos));
  }

  process.nextTick(function () {
    if (pos != val.length) {
      this.printNextBatch(val, pos);
    } else {
      this.emit('printed', val);
    }
  }.bind(this));
};

Lcd.prototype.clear = function() {
  this.command(0x01);
  setTimeout(function () {
    this.emit('clear');
  }.bind(this), 3); // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
};

Lcd.prototype.home = function() {
  this.command(0x02);
  setTimeout(function () {
    this.emit('home');
  }.bind(this), 3); // Wait > 1.52ms. There were issues waiting for 2ms so wait 3ms.
};

Lcd.prototype.rowOffsets = [0x00, 0x40, 0x14, 0x54];
Lcd.prototype.setCursor = function(col, row) {
  var r = row > this.rows ? this.rows - 1 : row;
  this.command(0x80 | (col + this.rowOffsets[r]));
};

Lcd.prototype.display = function() {
  this.displayControl |= 0x04;
  this.command(this.displayControl);
};

Lcd.prototype.noDisplay = function() {
  this.displayControl &= ~0x04;
  this.command(this.displayControl);
};

Lcd.prototype.cursor = function() {
  this.displayControl |= 0x02;
  this.command(this.displayControl);
};

Lcd.prototype.noCursor = function() {
  this.displayControl &= ~0x02;
  this.command(this.displayControl);
};

Lcd.prototype.blink = function() {
  this.displayControl |= 0x01;
  this.command(this.displayControl);
};

Lcd.prototype.noBlink = function() {
  this.displayControl &= ~0x01;
  this.command(this.displayControl);
};

Lcd.prototype.scrollDisplayLeft = function() {
  this.command(0x18);
};

Lcd.prototype.scrollDisplayRight = function() {
  this.command(0x1c);
};

Lcd.prototype.leftToRight = function() {
  this.displayMode |= 0x02;
  this.command(this.displayMode);
};

Lcd.prototype.rightToLeft = function() {
  this.displayMode &= ~0x02;
  this.command(this.displayMode);
};

Lcd.prototype.autoscroll = function() {
  this.displayMode |= 0x01;
  this.command(this.displayMode);
};

Lcd.prototype.noAutoscroll = function() {
  this.displayMode &= ~0x01;
  this.command(this.displayMode);
};

Lcd.prototype.close = function() {
  var i;

  this.rs.unexport();
  this.e.unexport();

  for (i = 0; i < this.data.length; ++i) {
    this.data[i].unexport();
  }
};

// private
Lcd.prototype.command = function(cmd) {
  this.rs.writeSync(0);
  this.write(cmd);
};

// private
Lcd.prototype.write = function(val) {
  this.write4Bits(val >> 4);
  this.write4Bits(val);
};

// private
Lcd.prototype.write4Bits = function(val) {
  var i;

  for (i = 0; i < this.data.length; ++i, val = val >> 1) {
    this.data[i].writeSync(val & 1);
  }

  this.e.writeSync(1); // enable pulse >= 300ns
  this.e.writeSync(0);
};

