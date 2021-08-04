// node legacy.js
//
// Older versions of Node JS (e.g. v11.15.0) do not support globalThis.
// This demonstrates that VexFlow can be imported even if globalThis is not available.

/* eslint-disable no-console */

const Vex = require('../../build/vexflow-debug');
console.log(Vex);
