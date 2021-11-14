// node require.js
//
// NOTE: The self referencing require(...) statement works here because of the package.json exports field.

/* eslint-disable no-console */

// const Vex = require('vexflow');
// const Vex = require('vexflow/core');
const Vex = require('vexflow/core-with-gonville');

console.log(Vex.Flow.getMusicFont());
console.log(Vex.Flow.BUILD);
