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
    Vex.Flow.Test.ClefKeySignature.keys,
    {majorKeys: true});
  
  Vex.Flow.Test.runTests("Minor Key Clef Test", 
    Vex.Flow.Test.ClefKeySignature.keys,
    {majorKeys: false});
  
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
 
Vex.Flow.Test.ClefKeySignature.keys = function(options, contextBuilder) {

  var clefs = 
    ["treble",
    "soprano",
    "mezzo-soprano",
    "alto",
    "tenor",
    "baritone-f",
    "baritone-c",
    "bass",
    "french",
    "subbass",
    "percussion"];

  var ctx = new contextBuilder(options.canvas_sel, 400, 20 + 80 * 2 * clefs.length);


  var staves = [];
  var keys = (options.params.majorKeys) ? 
    Vex.Flow.Test.ClefKeySignature.MAJOR_KEYS :
    Vex.Flow.Test.ClefKeySignature.MINOR_KEYS;

  var i, flat, sharp, keySig;

  var yOffsetForFlatStaves = 10 + 80 * clefs.length;
  for(i = 0; i<clefs.length; i++) {
    // Render all the sharps first, then all the flats:
    staves[i] = new Vex.Flow.Stave(10, 10 + 80*i, 390);
    staves[i].addClef(clefs[i]);
    staves[i+clefs.length] = new Vex.Flow.Stave(10, yOffsetForFlatStaves + 10 + 80*i, 390);
    staves[i+clefs.length].addClef(clefs[i]);

    for(flat = 0; flat < 8; flat++) {
      keySig = new Vex.Flow.KeySignature(keys[flat]);
      keySig.addToStave(staves[i]);
    }

    for(sharp = 8; sharp < keys.length; sharp++) {
      keySig = new Vex.Flow.KeySignature(keys[sharp]);
      keySig.addToStave(staves[i+clefs.length]);
    }

    staves[i].setContext(ctx);
    staves[i].draw();
    staves[i + clefs.length].setContext(ctx);
    staves[i + clefs.length].draw();
  }

  ok(true, "all pass");
};

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
