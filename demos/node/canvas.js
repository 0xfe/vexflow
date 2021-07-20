// node canvas.js > output.html

const { createCanvas } = require('canvas');
const Vex = require('../../build/vexflow-debug');
const VF = Vex.Flow;

const canvas = createCanvas(500, 500);

const renderer = new VF.Renderer(canvas, VF.Renderer.Backends.CANVAS);
const context = renderer.getContext();
context.setFont('Arial', 10, '').setBackgroundFillStyle('#eed');

const stave = new VF.Stave(10, 40, 400);
stave.addClef('treble');
stave.addTimeSignature('4/4');
stave.setContext(context).draw();

console.log(`<!DOCTYPE html><html><body><img src="${canvas.toDataURL()}"></body></html>`);
