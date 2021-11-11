// node index.js

/* eslint-disable no-console */

import { Vex } from '../../../build/esm/vexflow.js';

// This folder includes a package.json which indicates that all JS files should be treated as ES modules.
// Thus, we need to use build/esm/vexflow.js which ends in the lines:
//     export { Vex };
//     export default Vex;
// However, the ES module version of vexflow.js is NOT compatible with classic <script src="..."></script> tags.

// console.log(this);       // this === undefined
// console.log(window);     // ReferenceError: window is not defined
// console.log(self);       // ReferenceError: self is not defined
// console.log(global);     // success! global is the Node JS global object.
// console.log(globalThis); // success! globalThis is the Node JS global object.
// console.log(globalThis === global); // true

console.log('VexFlow BUILD: ' + Vex.Flow.BUILD);
