// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// Utility methods used by the rest of the VexFlow codebase.

import { Flow } from './flow';
import { log, RuntimeError } from './util';

const Vex = {
  Flow: Flow,

  // eslint-disable-next-line
  forEach: (a: any[], fn: any) => {
    for (let i = 0; i < a.length; i++) {
      fn(a[i], i);
    }
  },

  /**
   * Take `arr` and return a new list consisting of the sorted, unique,
   * contents of arr. Does not modify `arr`.
   */
  // eslint-disable-next-line
  SortAndUnique: (arr: any[], cmp: any, eq: any) => {
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
  },

  /** Check if array `arr` contains `obj`. */
  // eslint-disable-next-line
  Contains: (arr: any[], obj: any) => {
    let i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  },

  // Get the 2D Canvas context from DOM element `canvas_sel`.
  getCanvasContext: (canvas_sel: string): RenderingContext => {
    if (!canvas_sel) {
      throw new RuntimeError('BadArgument', 'Invalid canvas selector: ' + canvas_sel);
    }

    const canvas = document.getElementById(canvas_sel) as HTMLCanvasElement;
    if (!(canvas && canvas.getContext)) {
      throw new RuntimeError('UnsupportedBrowserError', 'This browser does not support HTML5 Canvas');
    }

    return canvas.getContext('2d') as RenderingContext;
  },

  /** Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds. */
  // eslint-disable-next-line
  BM: (s: any, f: any) => {
    const start_time = new Date().getTime();
    f();
    const elapsed = new Date().getTime() - start_time;
    log(s, elapsed + 'ms');
  },

  // Get stack trace.
  StackTrace: (): string | undefined => {
    const err = new Error();
    return err.stack;
  },
};

export default Vex;
