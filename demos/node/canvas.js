// node canvas.js > output.html

const Vex = require('vexflow');

const { createCanvas } = require('canvas');

const { Renderer, Stave } = Vex.Flow;

const canvas = createCanvas(1000, 500);

const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
const context = renderer.getContext();
context.setFont('Arial', 10).setBackgroundFillStyle('#eed');
context.scale(2, 2);

const stave = new Stave(10, 40, 400);
stave.addClef('treble');
stave.addTimeSignature('4/4');
stave.setContext(context).draw();

console.log(`<!DOCTYPE html><html><body><img width="500" src="${canvas.toDataURL()}"></body></html>`);
