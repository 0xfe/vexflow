// VexFlow - Basic Tests

Vex.Flow.Test.KeySignature = {}

Vex.Flow.Test.KeySignature.MAJOR_KEYS = [
  "C",
  "F",
  "Bb",
  "Eb",
  "Ab",
  "Db",
  "Gb",
  "Cb",
  "G",
  "D",
  "A#",
  "E#",
  "B#",
  "F#",
  "C#"];

Vex.Flow.Test.KeySignature.MINOR_KEYS = [
  "Am",
  "Dm",
  "Gm",
  "Cm",
  "Fm",
  "Bbm",
  "Ebm",
  "Abm",
  "Em",
  "Bm",
  "F#m",
  "C#m",
  "G#m",
  "D#m",
  "A#m"];


Vex.Flow.Test.KeySignature.Start = function() {
  module("KeySignature");
  Vex.Flow.Test.runTest("Major Key Test", Vex.Flow.Test.KeySignature.majorKeys);
  Vex.Flow.Test.runRaphaelTest("Major Key Test (Raphael)", 
      Vex.Flow.Test.KeySignature.majorKeys);
  Vex.Flow.Test.runTest("Minor Key Test", Vex.Flow.Test.KeySignature.minorKeys);
  Vex.Flow.Test.runRaphaelTest("Minor Key Test (Raphael)", 
      Vex.Flow.Test.KeySignature.minorKeys);
  Vex.Flow.Test.runTest("Stave Helper", Vex.Flow.Test.KeySignature.staveHelper);

}

Vex.Flow.Test.KeySignature.majorKeys = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 240);
  var stave = new Vex.Flow.Stave(10, 10, 350);
  var stave2 = new Vex.Flow.Stave(10, 90, 350);
  var keys = Vex.Flow.Test.KeySignature.MAJOR_KEYS;

  for (var i = 0; i < 8; ++i) {
    var keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.addToStave(stave);
  }

  for (var i = 8; i < keys.length; ++i) {
    var keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.addToStave(stave2);
  }


  stave.setContext(ctx);
  stave.draw();
  stave2.setContext(ctx);
  stave2.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.KeySignature.minorKeys = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 240);
  var stave = new Vex.Flow.Stave(10, 10, 350);
  var stave2 = new Vex.Flow.Stave(10, 90, 350);
  var keys = Vex.Flow.Test.KeySignature.MINOR_KEYS;

  for (var i = 0; i < 8; ++i) {
    var keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.addToStave(stave);
  }

  for (var i = 8; i < keys.length; ++i) {
    var keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.addToStave(stave2);
  }


  stave.setContext(ctx);
  stave.draw();
  stave2.setContext(ctx);
  stave2.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.KeySignature.staveHelper = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 240);
  var stave = new Vex.Flow.Stave(10, 10, 350);
  var stave2 = new Vex.Flow.Stave(10, 90, 350);
  var keys = Vex.Flow.Test.KeySignature.MAJOR_KEYS;

  for (var i = 0; i < 8; ++i) {
    stave.addKeySignature(keys[i]);
  }

  for (var i = 8; i < keys.length; ++i) {
    stave2.addKeySignature(keys[i]);
  }

  stave.setContext(ctx);
  stave.draw();
  stave2.setContext(ctx);
  stave2.draw();

  ok(true, "all pass");
}
