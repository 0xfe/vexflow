// This is not the test runner! 
// To execute tests, do `node tests/nodejsrunner.js`.

var fs = require('fs');
var vm = require('vm');

var jsdom = require('jsdom');
document = jsdom.jsdom("<html><head></head><body><div id='vexflow_testoutput'></div></body>");
window = document.createWindow();
$ = require('jquery');
Vex.document = document;

var sources = [
  "vexflow_test_helpers.js",
  "mocks.js",
  "stave_tests.js",
  "tabstave_tests.js",
  "voice_tests.js",
  "stavenote_tests.js",
  "tabnote_tests.js",
  "tickcontext_tests.js",
  "modifier_tests.js",
  "accidental_tests.js",
  "dot_tests.js",
  "bend_tests.js",
  "formatter_tests.js",
  "stavetie_tests.js",
  "tabtie_tests.js",
  "tabslide_tests.js",
  "beam_tests.js",
  "vibrato_tests.js",
  "annotation_tests.js",
  "tuning_tests.js",
  "keysignature_tests.js",
  "timesignature_tests.js",
  "clef_tests.js",
  "music_tests.js",
  "keymanager_tests.js",
  "articulation_tests.js",
  "staveconnector_tests.js",
  "percussion_tests.js",
  "key_clef_tests.js",
  "stavehairpin_tests.js"
]

for (var i = 0; i < sources.length; i += 1) {
  var filename = __dirname + '/' + sources[i];
  console.log("Including " + filename);
  var code = fs.readFileSync(filename, "utf8");
  code = code.replace("module", "QUnit.module");
  vm.runInThisContext(code);
}

// Disable Raphael tests for now
Vex.Flow.Test.runRaphaelTest = function() {}
Vex.Flow.Test.Articulation.runRaphaelTest = function() {}

Vex.Flow.Test.Stave.Start();
Vex.Flow.Test.TabStave.Start();
Vex.Flow.Test.Voice.Start();
Vex.Flow.Test.StaveNote.Start();
Vex.Flow.Test.TabNote.Start();
Vex.Flow.Test.TickContext.Start();
Vex.Flow.Test.ModifierContext.Start();
Vex.Flow.Test.Accidental.Start();
Vex.Flow.Test.Dot.Start();
Vex.Flow.Test.Bend.Start();
Vex.Flow.Test.Formatter.Start();
Vex.Flow.Test.Clef.Start();
Vex.Flow.Test.KeySignature.Start();
Vex.Flow.Test.TimeSignature.Start();
Vex.Flow.Test.StaveTie.Start();
Vex.Flow.Test.TabTie.Start();
Vex.Flow.Test.TabSlide.Start();
Vex.Flow.Test.Beam.Start();
Vex.Flow.Test.Vibrato.Start();
Vex.Flow.Test.Annotation.Start();
Vex.Flow.Test.Tuning.Start();
Vex.Flow.Test.Music.Start();
Vex.Flow.Test.KeyManager.Start();
Vex.Flow.Test.Articulation.Start();
Vex.Flow.Test.StaveConnector.Start();
Vex.Flow.Test.Percussion.Start();
Vex.Flow.Test.ClefKeySignature.Start();
Vex.Flow.Test.StaveHairpin.Start();

// Now export all canvases
QUnit.done(function() {
  var outputDir = __dirname + '/output'
  require('mkdirp')(outputDir);
  var numActive = 0;

  $('.testcanvas').each(function() {
    var name = $(this).find('.name').text().replace("/",",");
    var canvas = $(this).find('canvas')[0];
    console.log("Saving " + name);

    var filename = outputDir + '/' + name + ".png";
    var out = fs.createWriteStream(filename);
    var stream = canvas.createPNGStream();
    stream.on('data', function(chunk) {out.write(chunk);});
    stream.on('end', function() {
        console.log("Exported", filename);
        --numActive;
        if (numActive == 0) {
            console.log("Done");
            setTimeout(process.exit, 1000);
        }
    })
    ++numActive;
  });
});
