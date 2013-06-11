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
  "A",
  "E",
  "B",
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
  test("Key Parser Test", Vex.Flow.Test.KeySignature.parser);
  Vex.Flow.Test.runTest("Major Key Test", Vex.Flow.Test.KeySignature.majorKeys);
  Vex.Flow.Test.runRaphaelTest("Major Key Test (Raphael)", 
      Vex.Flow.Test.KeySignature.majorKeys);
  Vex.Flow.Test.runTest("Minor Key Test", Vex.Flow.Test.KeySignature.minorKeys);
  Vex.Flow.Test.runRaphaelTest("Minor Key Test (Raphael)", 
      Vex.Flow.Test.KeySignature.minorKeys);
  Vex.Flow.Test.runTest("Stave Helper", Vex.Flow.Test.KeySignature.staveHelper);

}

Vex.Flow.Test.KeySignature.catchError = function(spec) {
  try {
    Vex.Flow.keySignature(spec);
  } catch (e) {  
    equal(e.code, "BadKeySignature", e.message);
  }
}

Vex.Flow.Test.KeySignature.parser = function() {
  expect(11);
  Vex.Flow.Test.KeySignature.catchError("asdf");
  Vex.Flow.Test.KeySignature.catchError("D!");
  Vex.Flow.Test.KeySignature.catchError("E#");
  Vex.Flow.Test.KeySignature.catchError("D#");
  Vex.Flow.Test.KeySignature.catchError("#");
  Vex.Flow.Test.KeySignature.catchError("b");
  Vex.Flow.Test.KeySignature.catchError("Kb");
  Vex.Flow.Test.KeySignature.catchError("Fb");
  Vex.Flow.Test.KeySignature.catchError("Ab");
  Vex.Flow.Test.KeySignature.catchError("Dbm");
  Vex.Flow.Test.KeySignature.catchError("B#m");

  Vex.Flow.keySignature("B");
  Vex.Flow.keySignature("C");
  Vex.Flow.keySignature("Fm");
  Vex.Flow.keySignature("Ab");
  Vex.Flow.keySignature("Abm");
  Vex.Flow.keySignature("F#");
  Vex.Flow.keySignature("G#m");

  ok(true, "all pass");
}
 
Vex.Flow.Test.KeySignature.majorKeys = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 240);
  var stave = new Vex.Flow.Stave(10, 10, 350);
  var stave2 = new Vex.Flow.Stave(10, 90, 350);
  var keys = Vex.Flow.Test.KeySignature.MAJOR_KEYS;

  var keySig = null;
  for (var i = 0; i < 8; ++i) {
    keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.addToStave(stave);
  }

  for (var n = 8; n < keys.length; ++n) {
    keySig = new Vex.Flow.KeySignature(keys[n]);
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

  var keySig = null;
  for (var i = 0; i < 8; ++i) {
    keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.addToStave(stave);
  }

  for (var n = 8; n < keys.length; ++n) {
    keySig = new Vex.Flow.KeySignature(keys[n]);
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

  for (var n = 8; n < keys.length; ++n) {
    stave2.addKeySignature(keys[n]);
  }

  stave.setContext(ctx);
  stave.draw();
  stave2.setContext(ctx);
  stave2.draw();

  ok(true, "all pass");
}
