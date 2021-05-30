// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements utility methods used by the rest of the VexFlow
// codebase.
//

import { RuntimeError } from './util';
import { RenderContext } from './types/common';
import { Flow } from './tables';

export const Vex = {
  Flow: Flow,
  // Default log function sends all arguments to console.
  L:
    // eslint-disable-next-line
    (block: string, ...args: any[]) => {
      if (!args) return;
      const line = Array.prototype.slice.call(args).join(' ');
      window.console.log(block + ': ' + line);
    },

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  MakeException: (name: string) => {
    const exception = class extends Error {
      // eslint-disable-next-line
      data: any;
      // eslint-disable-next-line
      constructor(message: string, data: any) {
        super(message);
        this.name = name;
        this.message = message;
        this.data = data;
      }
    };

    return exception;
  },

  // Merge `destination` hash with `source` hash, overwriting like keys
  // in `source` if necessary.
  Merge:
    // eslint-disable-next-line
    (destination: any, source: any) => {
      for (const property in source) {
        // eslint-disable-line guard-for-in
        destination[property] = source[property];
      }
      return destination;
    },

  // DEPRECATED. Use `Math.*`.
  Min: Math.min,
  Max: Math.max,
  forEach:
    // eslint-disable-next-line
  (a: any[], fn: any) => {
      for (let i = 0; i < a.length; i++) {
        fn(a[i], i);
      }
    },

  // Round number to nearest fractional value (`.5`, `.25`, etc.)
  RoundN: (x: number, n: number): number =>
    x % n >= n / 2 ? parseInt(`${x} / ${n}`, 10) * n + n : parseInt(`${x} / ${n}`, 10) * n,

  // Locate the mid point between stave lines. Returns a fractional line if a space.
  MidLine: (a: number, b: number): number => {
    let mid_line = b + (a - b) / 2;
    if (mid_line % 2 > 0) {
      mid_line = Vex.RoundN(mid_line * 10, 5) / 10;
    }
    return mid_line;
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

  // Draw a tiny dot marker on the specified canvas. A great debugging aid.
  //
  // `ctx`: Canvas context.
  // `x`, `y`: Dot coordinates.
  drawDot: (ctx: RenderContext, x: number, y: number, color = '#55'): void => {
    ctx.save();
    ctx.setFillStyle(color);

    // draw a circle
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  },

  // Benchmark. Run function `f` once and report time elapsed shifted by `s` milliseconds.
  BM:
    // eslint-disable-next-line
  (s: any, f: any) => {
      const start_time = new Date().getTime();
      f();
      const elapsed = new Date().getTime() - start_time;
      Vex.L(s, elapsed + 'ms');
    },

  // Get stack trace.
  StackTrace: (): string | undefined => {
    const err = new Error();
    return err.stack;
  },

  // Dump warning to console.
  W:
    // eslint-disable-next-line
    (...args: any[]) => {
      const line = args.join(' ');
      window.console.log('Warning: ', line, Vex.StackTrace());
    },

  // Used by various classes (e.g., SVGContext) to provide a
  // unique prefix to element names (or other keys in shared namespaces).
  Prefix: (text: string): string => 'vf-' + text,
};
