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
  Vex.Flow.Test.runTests("Major Key Test", Vex.Flow.Test.KeySignature.majorKeys);
  
  Vex.Flow.Test.runTests("Minor Key Test", Vex.Flow.Test.KeySignature.minorKeys);
  
  Vex.Flow.Test.runTests("Stave Helper", Vex.Flow.Test.KeySignature.staveHelper);
  Vex.Flow.Test.runTests("Cancelled key test", Vex.Flow.Test.KeySignature.majorKeysCanceled);

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

Vex.Flow.Test.KeySignature.majorKeysCanceled = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 780, 500);
  ctx.scale(0.9, 0.9);
  var stave = new Vex.Flow.Stave(10, 10, 750).addTrebleGlyph();
  var stave2 = new Vex.Flow.Stave(10, 90, 750).addTrebleGlyph();
  var stave3 = new Vex.Flow.Stave(10, 170, 750).addTrebleGlyph();
  var stave4 = new Vex.Flow.Stave(10, 250, 750).addTrebleGlyph();
  var keys = Vex.Flow.Test.KeySignature.MAJOR_KEYS;

  var keySig = null;
  var i, n;
  for (i = 0; i < 8; ++i) {
    keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.cancelKey("Cb");

    keySig.padding = 18;
    keySig.addToStave(stave);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new Vex.Flow.KeySignature(keys[n]);
    keySig.cancelKey("C#");
    keySig.padding = 20;
    keySig.addToStave(stave2);
  }

  for (i = 0; i < 8; ++i) {
    keySig = new Vex.Flow.KeySignature(keys[i]);
    keySig.cancelKey("E");

    keySig.padding = 18;
    keySig.addToStave(stave3);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new Vex.Flow.KeySignature(keys[n]);
    keySig.cancelKey("Ab");
    keySig.padding = 20;
    keySig.addToStave(stave4);
  }

  stave.setContext(ctx);
  stave.draw();
  stave2.setContext(ctx);
  stave2.draw();
  stave3.setContext(ctx);
  stave3.draw();
  stave4.setContext(ctx);
  stave4.draw();


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
