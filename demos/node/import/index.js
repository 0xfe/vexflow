// node index.js

/* eslint-disable no-console */

import Vex from '../../../build/vexflow-debug.js';

// If you copy vexflow-debug.js to this folder and then update the import as follows:
//     import Vex from './vexflow-debug.js';
// It will fail with error:
//     SyntaxError: The requested module './vexflow-debug.js' does not provide an export named 'default'
// This is because this folder includes a package.json which indicates that all JS files should be treated as ES6 modules.
// To fix this, append the following to the end of vexflow-debug.js:
//     export default Vex;
// However, doing so will make vexflow-debug.js incompatible with classic <script src="..."></script> tags.

// console.log(this);       // this === undefined
// console.log(window);     // ReferenceError: window is not defined
// console.log(self);       // ReferenceError: self is not defined
// console.log(global);     // success! global is the Node JS global object.
// console.log(globalThis); // success! globalThis is the Node JS global object.
// console.log(globalThis === global); // true

console.log('VexFlow BUILD: ' + Vex.Flow.BUILD);
