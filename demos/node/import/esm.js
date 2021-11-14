// node esm.js

/* eslint-disable no-console */

import { Vex } from '../../../build/esm/vexflow-debug.js';

// This folder includes a package.json which indicates that all JS files should be treated as ES modules.
// Thus, we need to use build/esm/vexflow.js or build/esm/vexflow-debug.js which end in the lines:
//     export { Vex };
//     export default Vex;
// Note: the ES module version of VexFlow is NOT compatible with classic <script src="..."></script> tags.

console.log('VexFlow BUILD: ' + Vex.Flow.BUILD);

// Some notes about running as an ES module.
// console.log(this);       // this === undefined
// console.log(window);     // ReferenceError: window is not defined
// console.log(self);       // ReferenceError: self is not defined
// console.log(global);     // global is the Node JS global object.
// console.log(globalThis); // globalThis is the Node JS global object.
// console.log(globalThis === global); // true
