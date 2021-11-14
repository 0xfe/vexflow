// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Utility methods used by the rest of the VexFlow codebase.

import { Flow } from './flow';
import { log, RuntimeError } from './util';

export class Vex {
  static Flow = Flow;

  // Users of `Vex.forEach(a, fn)` should use `Array.prototype.forEach()` instead.
  // static forEach<T>(arr: T[], callbackFn: (value: T, index: number, array: T[]) => void) {
  //   arr.forEach(callbackFn);
  // }

  /**
   * Take `arr` and return a new list consisting of the sorted, unique,
   * contents of arr. Does not modify `arr`.
   */
  // eslint-disable-next-line
  static sortAndUnique(arr: any[], cmp: any, eq: any): any[] {
    if (arr.length > 1) {
      const newArr = [];
      let last;
      arr.sort(cmp);

      for (let i = 0; i < arr.length; ++i) {
        if (i === 0 || !eq(arr[i], last)) {
          newArr.push(arr[i]);
        }
        last = arr[i];
      }

      return newArr;
    } else {
      return arr;
    }
  }

  /** Check if array `arr` contains `obj`. */
  // eslint-disable-next-line
  static contains(arr: any[], obj: any): boolean {
    let i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  }

  // Get the 2D Canvas context from DOM element `canvas_sel`.
  static getCanvasContext(canvasSelector: string): RenderingContext {
    if (!canvasSelector) {
      throw new RuntimeError('BadArgument', 'Invalid canvas selector: ' + canvasSelector);
    }

    const canvas = document.getElementById(canvasSelector) as HTMLCanvasElement;
    if (!(canvas && canvas.getContext)) {
      throw new RuntimeError('UnsupportedBrowserError', 'This browser does not support HTML5 Canvas');
    }

    return canvas.getContext('2d') as RenderingContext;
  }

  /** Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds. */
  // eslint-disable-next-line
  static benchmark(s: any, f: any): void {
    const start_time = new Date().getTime();
    f();
    const elapsed = new Date().getTime() - start_time;
    log(s, elapsed + 'ms');
  }

  // Get stack trace.
  static stackTrace(): string | undefined {
    const err = new Error();
    return err.stack;
  }

  // Backwards compatability with 3.0.9.
  static RERR: RuntimeError;

  // Backwards compatability with 3.0.9.
  static RuntimeError: RuntimeError;
}
