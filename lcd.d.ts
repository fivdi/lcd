declare module 'lcd' {
  import { EventEmitter } from 'events';
  export default class Lcd extends EventEmitter {
    constructor(args: {
      rs: number,
      e: number,
      data: [number, number, number, number],
      cols: number,
      rows: number,
    });

    print(val: any, cb?: (err: Error, str: string) => void): void;

    clear(cb?: (err: Error) => void): void;

    home(cb?: (err: Error) => void): void;

    setCursor(col: number, row: number): void;

    cursor(): void;

    noCursor(): void;

    blink(): void;

    noBlink(): void;

    scrollDisplayLeft(): void;

    scrollDisplayRight(): void;

    leftToRight(): void;

    rightToLeft(): void;

    autoscroll(): void;

    noAutoscroll(): void;

    close(): void;
  }
}
