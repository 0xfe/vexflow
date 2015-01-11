// VexFlow - Basic Tests

Vex.Flow.Test.ClefKeySignature = {}

Vex.Flow.Test.ClefKeySignature.MAJOR_KEYS = [
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

Vex.Flow.Test.ClefKeySignature.MINOR_KEYS = [
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


Vex.Flow.Test.ClefKeySignature.Start = function() {
  module("KeySignature");
  test("Key Parser Test", Vex.Flow.Test.ClefKeySignature.parser);
  Vex.Flow.Test.runTests("Major Key Clef Test", 
    Vex.Flow.Test.ClefKeySignature.majorKeys);
  
  Vex.Flow.Test.runTests("Minor Key Clef Test", 
    Vex.Flow.Test.ClefKeySignature.minorKeys);
  
  Vex.Flow.Test.runTests("Stave Helper", 
    Vex.Flow.Test.ClefKeySignature.staveHelper);

}

Vex.Flow.Test.ClefKeySignature.catchError = function(spec) {
  try {
    Vex.Flow.keySignature(spec);
  } catch (e) {
    equal(e.code, "BadKeySignature", e.message);
  }
}

Vex.Flow.Test.ClefKeySignature.parser = function() {
  expect(11);
  Vex.Flow.Test.ClefKeySignature.catchError("asdf");
  Vex.Flow.Test.ClefKeySignature.catchError("D!");
  Vex.Flow.Test.ClefKeySignature.catchError("E#");
  Vex.Flow.Test.ClefKeySignature.catchError("D#");
  Vex.Flow.Test.ClefKeySignature.catchError("#");
  Vex.Flow.Test.ClefKeySignature.catchError("b");
  Vex.Flow.Test.ClefKeySignature.catchError("Kb");
  Vex.Flow.Test.ClefKeySignature.catchError("Fb");
  Vex.Flow.Test.ClefKeySignature.catchError("Ab");
  Vex.Flow.Test.ClefKeySignature.catchError("Dbm");
  Vex.Flow.Test.ClefKeySignature.catchError("B#m");

  Vex.Flow.keySignature("B");
  Vex.Flow.keySignature("C");
  Vex.Flow.keySignature("Fm");
  Vex.Flow.keySignature("Ab");
  Vex.Flow.keySignature("Abm");
  Vex.Flow.keySignature("F#");
  Vex.Flow.keySignature("G#m");

  ok(true, "all pass");
}
 
Vex.Flow.Test.ClefKeySignature.majorKeys = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 400);
  var stave = new Vex.Flow.Stave(10, 10, 370);
  var stave2 = new Vex.Flow.Stave(10, 90, 370);
  var stave3 = new Vex.Flow.Stave(10, 170, 370);
  var stave4 = new Vex.Flow.Stave(10, 260, 370);
  stave.addClef("treble");
  stave2.addClef("bass");
  stave3.addClef("alto");
  stave4.addClef("tenor");
  var keys = Vex.Flow.Test.ClefKeySignature.MAJOR_KEYS;

  for (var n = 0; n < 8; ++n) {
    var keySig = new Vex.Flow.KeySignature(keys[n]);
    var keySig2 = new Vex.Flow.KeySignature(keys[n]);
    keySig.addToStave(stave);
    keySig2.addToStave(stave2);
  }

  for (var i = 8; i < keys.length; ++i) {
    var keySig3 = new Vex.Flow.KeySignature(keys[i]);
    var keySig4 = new Vex.Flow.KeySignature(keys[i]);
    keySig3.addToStave(stave3);
    keySig4.addToStave(stave4);
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

Vex.Flow.Test.ClefKeySignature.minorKeys = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 400);
  var stave = new Vex.Flow.Stave(10, 10, 370);
  var stave2 = new Vex.Flow.Stave(10, 90, 370);
  var stave3 = new Vex.Flow.Stave(10, 170, 370);
  var stave4 = new Vex.Flow.Stave(10, 260, 370);
  stave.addClef("treble");
  stave2.addClef("bass");
  stave3.addClef("alto");
  stave4.addClef("tenor");
  var keys = Vex.Flow.Test.ClefKeySignature.MINOR_KEYS;

  for (var n = 0; n < 8; ++n) {
    var keySig3 = new Vex.Flow.KeySignature(keys[n]);
    var keySig4 = new Vex.Flow.KeySignature(keys[n]);
    keySig3.addToStave(stave3);
    keySig4.addToStave(stave4);
  }

  for (var i = 8; i < keys.length; ++i) {
    var keySig = new Vex.Flow.KeySignature(keys[i]);
    var keySig2 = new Vex.Flow.KeySignature(keys[i]);
    keySig.addToStave(stave);
    keySig2.addToStave(stave2);
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

Vex.Flow.Test.ClefKeySignature.staveHelper = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 400);
  var stave = new Vex.Flow.Stave(10, 10, 370);
  var stave2 = new Vex.Flow.Stave(10, 90, 370);
  var stave3 = new Vex.Flow.Stave(10, 170, 370);
  var stave4 = new Vex.Flow.Stave(10, 260, 370);
  var keys = Vex.Flow.Test.ClefKeySignature.MAJOR_KEYS;
  
  stave.addClef("treble");
  stave2.addClef("bass");
  stave3.addClef("alto");
  stave4.addClef("tenor");

  for (var n = 0; n < 8; ++n) {
    stave.addKeySignature(keys[n]);
    stave2.addKeySignature(keys[n]);
  }

  for (var i = 8; i < keys.length; ++i) {
    stave3.addKeySignature(keys[i]);
    stave4.addKeySignature(keys[i]);
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
