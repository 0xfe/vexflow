// this is a loader for all the dependencies local files

window.Vex = require("./src/vex.js");
// these files extending the global Vex object
require("./src/flow.js");
require("./src/fraction.js");
require("./src/tables.js");
require("./src/fonts/vexflow_font.js");
require("./src/glyph.js");
require("./src/stave.js");
require("./src/staveconnector.js");
require("./src/tabstave.js");
require("./src/tickcontext.js");
require("./src/tickable.js");
require("./src/note.js");
require("./src/notehead.js");
require("./src/stem.js");
require("./src/stemmablenote.js");
require("./src/stavenote.js");
require("./src/tabnote.js");
require("./src/ghostnote.js");
require("./src/clefnote.js");
require("./src/timesignote.js");
require("./src/beam.js");
require("./src/voice.js");
require("./src/voicegroup.js");
require("./src/modifier.js");
require("./src/modifiercontext.js");
require("./src/accidental.js");
require("./src/dot.js");
require("./src/formatter.js");
require("./src/stavetie.js");
require("./src/tabtie.js");
require("./src/tabslide.js");
require("./src/bend.js");
require("./src/vibrato.js");
require("./src/annotation.js");
require("./src/articulation.js");
require("./src/tuning.js");
require("./src/stavemodifier.js");
require("./src/keysignature.js");
require("./src/timesignature.js");
require("./src/clef.js");
require("./src/music.js");
require("./src/keymanager.js");
require("./src/renderer.js");
require("./src/raphaelcontext.js");
require("./src/canvascontext.js");
require("./src/stavebarline.js");
require("./src/stavehairpin.js");
require("./src/stavevolta.js");
require("./src/staverepetition.js");
require("./src/stavesection.js");
require("./src/stavetempo.js");
require("./src/stavetext.js");
require("./src/barnote.js");
require("./src/tremolo.js");
require("./src/tuplet.js");
require("./src/boundingbox.js");
require("./src/textnote.js");
require("./src/frethandfinger.js");
require("./src/stringnumber.js");
require("./src/strokes.js");
require("./src/curve.js");
require("./src/staveline.js");
require("./src/crescendo.js");
require("./src/ornament.js");
require("./src/pedalmarking.js");
require("./src/textbracket.js");
require("./src/textdynamics.js");
require("./src/gracenote.js");
require("./src/gracenotegroup.js");

module.exports = Vex;