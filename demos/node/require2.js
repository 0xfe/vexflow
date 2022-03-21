// Demonstrate different ways to require the VexFlow module.

const { Vex, Flow, Stave, StaveNote, Formatter, Renderer } = require('vexflow');
const Vex2 = require('vexflow');
const Vex3 = require('../../build/cjs/vexflow-debug.js');
const Vex4 = require('../../build/cjs/vexflow-debug-with-tests.js');
const Vex5 = require('vexflow/bravura'); // This only includes the Bravura font.
const Vex6 = require('vexflow/petaluma'); // This only includes the Petaluma font.
const Vex7 = require('vexflow/gonville'); // This only includes the Gonville font.

console.log(Vex2.StaveNote);
console.log(Vex3.StaveNote);
console.log(Vex4.StaveNote);
console.log(Vex5.StaveNote);
console.log(Vex6.StaveNote);
console.log(Vex7.StaveNote);

//////////////////////////////////////////////////////////////////////////////////////////////////
// The following statements return true:
console.log(Vex.Flow === Flow);
console.log(Vex.Flow.StaveNote === Flow.StaveNote);
console.log(StaveNote === Flow.StaveNote);
console.log(Vex2.Vex === Vex);
console.log(Vex2.Flow === Flow);
console.log(Vex2.StaveNote === StaveNote);
console.log(Flow.Stave === Stave);
console.log(Vex6.Flow !== Vex7.Flow); // These were imported from different JS files.
