// node index.js

/* eslint-disable no-console */

import { Vex } from '../../../build/esm/vexflow.js';

// This folder includes a package.json which indicates that all JS files should be treated as ES6 modules.
// Thus, we need to use vexflow.module.js which ends in the line:
//     export default Vex;
// However, vexflow.module.js is incompatible with classic <script src="..."></script> tags.

// console.log(this);       // this === undefined
// console.log(window);     // ReferenceError: window is not defined
// console.log(self);       // ReferenceError: self is not defined
// console.log(global);     // success! global is the Node JS global object.
// console.log(globalThis); // success! globalThis is the Node JS global object.
// console.log(globalThis === global); // true

console.log('VexFlow BUILD: ' + Vex.Flow.BUILD);
