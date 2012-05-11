// An example of how to easily use Vexflow from Node.js
// Note that you must run build.sh, scons, or `npm run preinstall` 
// before using this.
console.log("Starting Node.js demo for Vexflow");

// In real use, this would be require("vexflow").
var Vex = require("../build/vexflow/vexflow-node.js");

// Outside the browser, Vexflow will automatically create 
// an empty DOM for you as Vex.document, 
// but feel free to use your own with something like:
// Vex.document = require('jsdom').jsdom("<html><body>...</body></html>");

// Either way, get a canvas element somehow (doesn't need to be attached).
// jsdom will give you a working canvas element
// as long as the canvas package is installed.
var canvas = Vex.document.createElement("canvas");
canvas.width = 600;
canvas.height = 200;

// Then follow the tutorial.
var renderer = new Vex.Flow.Renderer(canvas, 
  Vex.Flow.Renderer.Backends.CANVAS);
var ctx = renderer.getContext();
var stave = new Vex.Flow.Stave(10, 0, 500);
stave.addClef("treble").setContext(ctx).draw();

console.log(
  "The following data URL should be a single stave with a treble clef. " +
  "Paste into your browser address bar to verify.");

// And output to a data URL. Paste this into your browser location bar to see!
console.log(canvas.toDataURL());

// You can also use any of the Canvas extensions, including PDF export, at:
// https://github.com/LearnBoost/node-canvas
