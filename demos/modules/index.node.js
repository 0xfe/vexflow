// Usage:
// node index.node.js
//
// THIS EXAMPLE FAILS with error:
// SyntaxError: The requested module './vexflow-debug.js' does not provide an export named 'default'
//
// Solution: add the following to the bottom of vexflow-debug.js:
//
//   export default globalThis.Vex;
//
// However, doing so will make vexflow-debug.js incompatible with classic <script src="..."></script> tags.

import Vex from './vexflow-debug.js';

// console.log(this);       // this === undefined
// console.log(window);     // ReferenceError: window is not defined
// console.log(self);       // ReferenceError: self is not defined
// console.log(global);     // success! global is the Node JS global object.
// console.log(globalThis); // success! global is the Node JS global object.
// console.log(globalThis === global); // true

console.log('VexFlow BUILD: ' + Vex.Flow.BUILD);
