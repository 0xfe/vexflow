import Vex from './src/index.js';

// EasyScore API Example

const VF = Vex.Flow;

// Create an SVG renderer and attach it to the DIV element named "boo".
var vf = new VF.Factory({renderer: {elementId: null}});
var score = vf.EasyScore();
var system = vf.System();

system.addStave({
  voices: [score.voice(score.notes('C#5/q, B4, A4, G#4'))]
}).addClef('treble').addTimeSignature('4/4');

vf.draw();
