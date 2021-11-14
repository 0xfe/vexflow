// node canvas.js > output.html

/* eslint-disable no-console */

const { createCanvas } = require('canvas');
const Vex = require('../../build/vexflow-debug');

const { Renderer, Stave } = Vex.Flow;

const canvas = createCanvas(500, 500);

const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
const context = renderer.getContext();
context.setFont('Arial', 10).setBackgroundFillStyle('#eed');

const stave = new Stave(10, 40, 400);
stave.addClef('treble');
stave.addTimeSignature('4/4');
stave.setContext(context).draw();

console.log(`<!DOCTYPE html><html><body><img src="${canvas.toDataURL()}"></body></html>`);
