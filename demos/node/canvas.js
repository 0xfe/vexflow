// node canvas.js > output.html

// Use VexFlow to render a hello world score in a node-canvas context (https://www.npmjs.com/package/canvas).

// Since we use a require(...) statement below, we will load the CJS bundle at build/cjs/vexflow.js
// See the `exports` field in package.json for details.
// This bundle includes all three music engraving fonts: Bravura, Petaluma, and Gonville.
const Vex = require('vexflow');

// Or, you can include just a single music font:
// const Vex = require('vexflow/bravura');
// const Vex = require('vexflow/petaluma');
// const Vex = require('vexflow/gonville');

const { createCanvas } = require('canvas');

const { Renderer, Stave, StaveNote, Formatter } = Vex.Flow;

const canvas = createCanvas(1000, 500);

const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
const context = renderer.getContext();
context.setFont('Arial', 10);
context.scale(2, 2);

const stave = new Stave(10, 40, 400);
stave.addClef('treble');
stave.addTimeSignature('4/4');
stave.setContext(context).draw();

const notes = [
  //
  new StaveNote({ keys: ['c/5'], duration: '4' }),
  new StaveNote({ keys: ['b/4'], duration: '4' }),
  new StaveNote({ keys: ['a/4'], duration: '4' }),
  new StaveNote({ keys: ['g/4'], duration: '4' }),
];

Formatter.FormatAndDraw(context, stave, notes);

console.log(`<!DOCTYPE html><html><body><img width="500" src="${canvas.toDataURL()}"></body></html>`);
