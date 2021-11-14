// node legacy.js
//
// This demonstrates that VexFlow can be imported even with older versions of Node JS (e.g. v11.15.0).
// Those older versions do not support `globalThis`, but provide `global` and `this` as the global object.

/* eslint-disable no-console */

const Vex = require('../../build/cjs/vexflow');

const { Flow, Stave, StaveNote } = Vex.Flow;

console.log(Flow.BUILD);

console.log(Stave);

console.log(StaveNote);
