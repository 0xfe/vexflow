// Usage:
// node index.js
//
// THIS DEMO CURRENTLY FAILS WITH ERROR:
//   SyntaxError: The requested module './vexflow-debug.js' does not provide an export named 'default'

import Vex from './vexflow-debug.js';

export function showThis() {
  // window, if in a browser.
  // undefined if in Node JS.
  console.log('this: ' + this);

  // window, if in a browser.
  // global object, if in Node JS.
  console.log('globalThis: ' + globalThis);
}

showThis();

console.log('VexFlow BUILD: ' + Vex.Flow.BUILD);
