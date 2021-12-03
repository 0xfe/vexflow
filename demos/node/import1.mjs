// node import.mjs

// This file needs to have the .mjs extension, or the nearest package.json needs to specify type="module".
// Otherwise, the import statement will not work.
// Since this file is an ES module, we need to use build/esm/entry/vexflow.js which exports all the types you need.
// The ES module version of VexFlow is NOT compatible with classic <script src="..."></script> tags.

import { Vex } from 'vexflow';

// The above import statement is equivalent to the following:
// import { Vex } from '../../build/esm/entry/vexflow.js';
// It works because our package.json has an exports field that points to the correct ESM entry point:
/*
"exports": {
  ".": {
    "types": "./build/types/entry/vexflow.d.ts",
    "require": "./build/cjs/vexflow.js",
    "import": "./build/esm/entry/vexflow.js"
  },
  ...
}
*/

console.log('VexFlow BUILD: ' + Vex.Flow.BUILD);

// Some notes about running as an ES module.
// console.log(this);       // this === undefined
// console.log(window);     // ReferenceError: window is not defined
// console.log(self);       // ReferenceError: self is not defined
// console.log(global);     // global is the Node JS global object.
// console.log(globalThis); // globalThis is the Node JS global object.
// console.log(globalThis === global); // true
