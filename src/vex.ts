// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements utility methods used by the rest of the VexFlow
// codebase.
//

import { log, RuntimeError } from './util';
import { Flow } from './flow';

export const Vex = {
  Flow: Flow,

  forEach:
    // eslint-disable-next-line
  (a: any[], fn: any) => {
      for (let i = 0; i < a.length; i++) {
        fn(a[i], i);
      }
    },

  // Take `arr` and return a new list consisting of the sorted, unique,
  // contents of arr. Does not modify `arr`.
  SortAndUnique:
    // eslint-disable-next-line
    (arr: any[], cmp: any, eq: any) => {
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

  // Check if array `a` contains `obj`.
  Contains:
    // eslint-disable-next-line
    (a: any[], obj: any) => {
      let i = a.length;
      while (i--) {
        if (a[i] === obj) {
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

  // Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds.
  BM:
    // eslint-disable-next-line
  (s: any, f: any) => {
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
