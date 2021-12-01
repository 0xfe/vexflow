// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
//
// Utilities for working with Web APIs.
// See: https://developer.mozilla.org/en-US/docs/Web/API

import { globalObject } from './util';

// eslint-disable-next-line
export function isHTMLCanvas(element: any): element is HTMLCanvasElement {
  if (!element) return false;

  const global = globalObject();
  return (
    // It's either an instance of the HTMLCanvasElement class,
    (typeof global.HTMLCanvasElement === 'function' && element instanceof global.HTMLCanvasElement) ||
    // OR it's pretending to be a <canvas> element. Good enough!
    // Do not rely on .tagName, because node-canvas doesn't provide a tagName.
    (typeof element.getContext === 'function' && typeof element.toDataURL === 'function')
  );
}

// eslint-disable-next-line
export function isHTMLDiv(element: any): element is HTMLDivElement {
  if (!element) return false;

  const global = globalObject();
  return (
    // It's either an instance of the HTMLDivElement class.
    (typeof global.HTMLDivElement === 'function' && element instanceof global.HTMLDivElement) ||
    // OR it's pretending to be a <div>. See: svgcontext.ts.
    (typeof element.appendChild === 'function' && typeof element.style === 'object')
  );
}
