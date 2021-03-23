/**
 * VexFlow - Clef-Key Signature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ClefKeySignature = (function () {
  var ClefKeySignature = {
    MAJOR_KEYS: ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'],

    MINOR_KEYS: ['Am', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'],

    Start: function () {
      QUnit.module('Clef Keys');
      QUnit.test('Key Parser Test', VF.Test.ClefKeySignature.parser);
      VF.Test.runTests('Major Key Clef Test', VF.Test.ClefKeySignature.keys, { majorKeys: true });
      VF.Test.runTests('Minor Key Clef Test', VF.Test.ClefKeySignature.keys, { majorKeys: false });
      VF.Test.runTests('Stave Helper', VF.Test.ClefKeySignature.staveHelper);
    },

    catchError: function (spec) {
      try {
        VF.keySignature(spec);
      } catch (e) {
        equal(e.code, 'BadKeySignature', e.message);
      }
    },

    parser: function () {
      expect(11);
      VF.Test.ClefKeySignature.catchError('asdf');
      VF.Test.ClefKeySignature.catchError('D!');
      VF.Test.ClefKeySignature.catchError('E#');
      VF.Test.ClefKeySignature.catchError('D#');
      VF.Test.ClefKeySignature.catchError('#');
      VF.Test.ClefKeySignature.catchError('b');
      VF.Test.ClefKeySignature.catchError('Kb');
      VF.Test.ClefKeySignature.catchError('Fb');
      VF.Test.ClefKeySignature.catchError('Ab');
      VF.Test.ClefKeySignature.catchError('Dbm');
      VF.Test.ClefKeySignature.catchError('B#m');

      VF.keySignature('B');
      VF.keySignature('C');
      VF.keySignature('Fm');
      VF.keySignature('Ab');
      VF.keySignature('Abm');
      VF.keySignature('F#');
      VF.keySignature('G#m');

      ok(true, 'all pass');
    },

    keys: function (options, contextBuilder) {
      var clefs = [
        'treble',
        'soprano',
        'mezzo-soprano',
        'alto',
        'tenor',
        'baritone-f',
        'baritone-c',
        'bass',
        'french',
        'subbass',
        'percussion',
      ];

      var ctx = contextBuilder(options.elementId, 400, 20 + 80 * 2 * clefs.length);
      var staves = [];
      var keys = options.params.majorKeys ? VF.Test.ClefKeySignature.MAJOR_KEYS : VF.Test.ClefKeySignature.MINOR_KEYS;

      var i;
      var flat;
      var sharp;
      var keySig;

      var yOffsetForFlatStaves = 10 + 80 * clefs.length;
      for (i = 0; i < clefs.length; i++) {
        // Render all the sharps first, then all the flats:
        staves[i] = new VF.Stave(10, 10 + 80 * i, 390);
        staves[i].addClef(clefs[i]);
        staves[i + clefs.length] = new VF.Stave(10, yOffsetForFlatStaves + 10 + 80 * i, 390);
        staves[i + clefs.length].addClef(clefs[i]);

        for (flat = 0; flat < 8; flat++) {
          keySig = new VF.KeySignature(keys[flat]);
          keySig.addToStave(staves[i]);
        }

        for (sharp = 8; sharp < keys.length; sharp++) {
          keySig = new VF.KeySignature(keys[sharp]);
          keySig.addToStave(staves[i + clefs.length]);
        }

        staves[i].setContext(ctx);
        staves[i].draw();
        staves[i + clefs.length].setContext(ctx);
        staves[i + clefs.length].draw();
      }

      ok(true, 'all pass');
    },

    staveHelper: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 400, 400);
      var stave = new VF.Stave(10, 10, 370);
      var stave2 = new VF.Stave(10, 90, 370);
      var stave3 = new VF.Stave(10, 170, 370);
      var stave4 = new VF.Stave(10, 260, 370);
      var keys = VF.Test.ClefKeySignature.MAJOR_KEYS;

      stave.addClef('treble');
      stave2.addClef('bass');
      stave3.addClef('alto');
      stave4.addClef('tenor');

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

      ok(true, 'all pass');
    },
  };

  return ClefKeySignature;
})();
