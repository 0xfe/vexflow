import { RenderContext } from './types/common';

export class RuntimeError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super('[RuntimeError] ' + code + ':' + message);
    this.code = code;
  }
}

export function check<T>(x?: T): T {
  if (x === undefined) {
    throw new RuntimeError('undefined');
  }
  return x;
}

export function MakeException(name: string): typeof exception {
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
}

// Default log function sends all arguments to console.
export function log(
  block: string,
  // eslint-disable-next-line
  ...args: any[]): void {
  if (!args) return;
  const line = Array.prototype.slice.call(args).join(' ');
  window.console.log(block + ': ' + line);
}

// Dump warning to console.
export function warn(
  // eslint-disable-next-line
  ...args: any[]): void {
  const line = args.join(' ');
  const err = new Error();
  window.console.log('Warning: ', line, err.stack);
}

// Round number to nearest fractional value (`.5`, `.25`, etc.)
function roundN(x: number, n: number): number {
  return x % n >= n / 2 ? parseInt(`${x / n}`, 10) * n + n : parseInt(`${x / n}`, 10) * n;
}

// Locate the mid point between stave lines. Returns a fractional line if a space.
export function midLine(a: number, b: number): number {
  let mid_line = b + (a - b) / 2;
  if (mid_line % 2 > 0) {
    mid_line = roundN(mid_line * 10, 5) / 10;
  }
  return mid_line;
}

// Draw a tiny dot marker on the specified canvas. A great debugging aid.
//
// `ctx`: Canvas context.
// `x`, `y`: Dot coordinates.
export function drawDot(ctx: RenderContext, x: number, y: number, color = '#55'): void {
  ctx.save();
  ctx.setFillStyle(color);

  // draw a circle
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Used by various classes (e.g., SVGContext) to provide a
// unique prefix to element names (or other keys in shared namespaces).
export function prefix(text: string): string {
  return `vf-${text}`;
}
