/**
 * VexFlow - Key Signature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeySignature = (function() {
  function catchError(spec) {
    try {
      VF.keySignature(spec);
    } catch (e) {
      equal(e.code, "BadKeySignature", e.message);
    }
  }

  KeySignature = {
    MAJOR_KEYS: [
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
      "C#"],

    MINOR_KEYS: [
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
      "A#m"],

    Start: function() {
      QUnit.module("KeySignature");
      test("Key Parser Test", VF.Test.KeySignature.parser);
      VF.Test.runTests("Major Key Test", VF.Test.KeySignature.majorKeys);
      VF.Test.runTests("Minor Key Test", VF.Test.KeySignature.minorKeys);
      VF.Test.runTests("Stave Helper", VF.Test.KeySignature.staveHelper);
      VF.Test.runTests("Cancelled key test", VF.Test.KeySignature.majorKeysCanceled);
    },

    parser: function() {
      expect(11);
      catchError("asdf");
      catchError("D!");
      catchError("E#");
      catchError("D#");
      catchError("#");
      catchError("b");
      catchError("Kb");
      catchError("Fb");
      catchError("Ab");
      catchError("Dbm");
      catchError("B#m");

      VF.keySignature("B");
      VF.keySignature("C");
      VF.keySignature("Fm");
      VF.keySignature("Ab");
      VF.keySignature("Abm");
      VF.keySignature("F#");
      VF.keySignature("G#m");

      ok(true, "all pass");
    },

    majorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }


      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, "all pass");
    },

    majorKeysCanceled: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i, n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey("Cb");

        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey("C#");
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey("E");

        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
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
    },

    minorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MINOR_KEYS;

      var keySig = null;
      for (var i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.addToStave(stave);
      }

      for (var n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.addToStave(stave2);
      }


      stave.setContext(ctx);
      stave.draw();
      stave2.setContext(ctx);
      stave2.draw();

      ok(true, "all pass");
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 240);
      var stave = new VF.Stave(10, 10, 350);
      var stave2 = new VF.Stave(10, 90, 350);
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

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
  };

  return KeySignature;
})();