// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { RenderContext } from './types/common';

/** `RuntimeError` will be thrown by VexFlow classes in case of error. */
export class RuntimeError extends Error {
  code: string;
  constructor(code: string, message: string = '') {
    super('[RuntimeError] ' + code + ': ' + message);
    this.code = code;
  }
}

/**
 * Check that `x` is of type `T` and not `undefined`.
 * If `x` is `undefined`, throw a RuntimeError with the optionally provided error code and message.
 */
export function defined<T>(x?: T, code: string = 'undefined', message: string = ''): T {
  if (x === undefined) {
    throw new RuntimeError(code, message);
  }
  return x;
}

/** Default log function sends all arguments to console. */
// eslint-disable-next-line
export function log(block: string, ...args: any[]): void {
  if (!args) return;
  const line = Array.prototype.slice.call(args).join(' ');
  window.console.log(block + ': ' + line);
}

/** Dump warning to console. */
// eslint-disable-next-line
export function warn(...args: any[]): void {
  const line = args.join(' ');
  const err = new Error();
  window.console.log('Warning: ', line, err.stack);
}

/** Round number to nearest fractional value (`.5`, `.25`, etc.) */
function roundN(x: number, n: number): number {
  return x % n >= n / 2 ? parseInt(`${x / n}`, 10) * n + n : parseInt(`${x / n}`, 10) * n;
}

/** Locate the mid point between stave lines. Returns a fractional line if a space. */
export function midLine(a: number, b: number): number {
  let mid_line = b + (a - b) / 2;
  if (mid_line % 2 > 0) {
    mid_line = roundN(mid_line * 10, 5) / 10;
  }
  return mid_line;
}

/**
 * Draw a tiny dot marker on the specified canvas. A great debugging aid.
 * @param ctx canvas context
 * @param x dot x coordinate
 * @param y dot y coordinate
 */
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

/**
 * Used by various classes (e.g., SVGContext) to provide a
 * unique prefix to element names (or other keys in shared namespaces).
 */
export function prefix(text: string): string {
  return `vf-${text}`;
}

/**
 * Convert an arbitrary angle in radians to the equivalent one in the range [0, pi).
 */
export function normalizeAngle(a: number): number {
  a = a % (2 * Math.PI);
  if (a < 0) {
    a += 2 * Math.PI;
  }
  return a;
}
