'use strict';

const Lcd = require('../lcd');
const lcd = new Lcd({rs: 23, e: 24, data: [17, 18, 22, 27], cols: 20, rows: 4});

lcd.on('error', err => console.log(err));

lcd.on('ready', _ => {
  lcd.print(new Array(81).join(String.fromCharCode(255)));
  lcd.once('printed', _ => {
    lcd.clear();
    lcd.once('clear', _ => {
      lcd.print('12345678');
      lcd.once('printed', _ => {
        lcd.home();
        lcd.once('home', _ => {
          lcd.print('ab');
          lcd.once('printed', _ => {
            lcd.setCursor(6, 0);
            lcd.print('cd');
            lcd.once('printed', _ => lcd.close());
          });
        });
      });
    });
  });
});

