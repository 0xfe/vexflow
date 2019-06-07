/**
 * VexFlow - Key Signature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeySignature = (function() {
  function catchError(spec) {
    try {
      VF.keySignature(spec);
    } catch (e) {
      equal(e.code, 'BadKeySignature', e.message);
    }
  }

  KeySignature = {
    MAJOR_KEYS: [
      'C',
      'F',
      'Bb',
      'Eb',
      'Ab',
      'Db',
      'Gb',
      'Cb',
      'G',
      'D',
      'A',
      'E',
      'B',
      'F#',
      'C#',
    ],

    MINOR_KEYS: [
      'Am',
      'Dm',
      'Gm',
      'Cm',
      'Fm',
      'Bbm',
      'Ebm',
      'Abm',
      'Em',
      'Bm',
      'F#m',
      'C#m',
      'G#m',
      'D#m',
      'A#m',
    ],

    Start: function() {
      QUnit.module('KeySignature');
      test('Key Parser Test', VF.Test.KeySignature.parser);
      VF.Test.runTests('Major Key Test', VF.Test.KeySignature.majorKeys);
      VF.Test.runTests('Minor Key Test', VF.Test.KeySignature.minorKeys);
      VF.Test.runTests('Stave Helper', VF.Test.KeySignature.staveHelper);
      VF.Test.runTests('Cancelled key test', VF.Test.KeySignature.majorKeysCanceled);
      VF.Test.runTests('Cancelled key (for each clef) test', VF.Test.KeySignature.keysCanceledForEachClef);
      VF.Test.runTests('Altered key test', VF.Test.KeySignature.majorKeysAltered);
      VF.Test.runTests('End key with clef test', VF.Test.KeySignature.endKeyWithClef);
      VF.Test.runTests('Key Signature Change test', VF.Test.KeySignature.changeKey);
    },

    parser: function() {
      expect(11);
      catchError('asdf');
      catchError('D!');
      catchError('E#');
      catchError('D#');
      catchError('#');
      catchError('b');
      catchError('Kb');
      catchError('Fb');
      catchError('Ab');
      catchError('Dbm');
      catchError('B#m');

      VF.keySignature('B');
      VF.keySignature('C');
      VF.keySignature('Fm');
      VF.keySignature('Ab');
      VF.keySignature('Abm');
      VF.keySignature('F#');
      VF.keySignature('G#m');

      ok(true, 'all pass');
    },

    majorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
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

      ok(true, 'all pass');
    },

    majorKeysCanceled: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i;
      var n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey('Cb');

        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey('C#');
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.cancelKey('E');

        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.cancelKey('Ab');
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

      ok(true, 'all pass');
    },

    keysCanceledForEachClef: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 600, 380);
      ctx.scale(0.8, 0.8);
      var keys = [
        'C#',
        'Cb'
      ];

      var x = 20;
      var y = 20;
      var tx = x;
      ['bass', 'tenor', 'soprano', 'mezzo-soprano', 'baritone-f'].forEach(function(clef) {
        keys.forEach(function(key) {
          var cancelKey = key === keys[0] ? keys[1] : keys[0];
          var vStave = new Vex.Flow.Stave(tx, y, 350);
          vStave.setClef(clef);
          vStave.addKeySignature(cancelKey);
          vStave.addKeySignature(key, cancelKey);
          vStave.addKeySignature(key);
          vStave.setContext(ctx).draw();
          tx += 350;
        });
        tx = x;
        y += 80;
      });

      ok(true, 'all pass');
    },

    majorKeysAltered: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 780, 500);
      ctx.scale(0.9, 0.9);
      var stave = new VF.Stave(10, 10, 750).addTrebleGlyph();
      var stave2 = new VF.Stave(10, 90, 750).addTrebleGlyph();
      var stave3 = new VF.Stave(10, 170, 750).addTrebleGlyph();
      var stave4 = new VF.Stave(10, 250, 750).addTrebleGlyph();
      var keys = VF.Test.KeySignature.MAJOR_KEYS;

      var keySig = null;
      var i;
      var n;
      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(['bs', 'bs']);
        keySig.padding = 18;
        keySig.addToStave(stave);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(['+', '+', '+']);
        keySig.padding = 20;
        keySig.addToStave(stave2);
      }

      for (i = 0; i < 8; ++i) {
        keySig = new VF.KeySignature(keys[i]);
        keySig.alterKey(['n', 'bs', 'bb']);
        keySig.padding = 18;
        keySig.addToStave(stave3);
      }

      for (n = 8; n < keys.length; ++n) {
        keySig = new VF.KeySignature(keys[n]);
        keySig.alterKey(['++', '+', 'n', '+']);
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

      ok(true, 'all pass');
    },

    minorKeys: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
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

      ok(true, 'all pass');
    },
    endKeyWithClef: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 200);
      ctx.scale(0.9, 0.9);
      var stave1 = new VF.Stave(10, 10, 350);
      stave1.setKeySignature('G')
        .setBegBarType(VF.Barline.type.REPEAT_BEGIN)
        .setEndBarType(VF.Barline.type.REPEAT_END)
        .setClef('treble')
        .addTimeSignature('4/4')
        .setEndClef('bass')
        .setEndKeySignature('Cb');
      var stave2 = new VF.Stave(10, 90, 350);
      stave2.setKeySignature('Cb')
        .setClef('bass')
        .setEndClef('treble')
        .setEndKeySignature('G');

      stave1.setContext(ctx).draw();
      stave2.setContext(ctx).draw();
      ok(true, 'all pass');
    },

    staveHelper: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 240);
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

      ok(true, 'all pass');
    },

    changeKey: function(options) {
      var vf = VF.Test.makeFactory(options, 900);

      var stave = vf.Stave(10, 10, 800)
        .addClef('treble')
        .addTimeSignature('C|');

      var voice = vf.Voice().setStrict(false).addTickables([
        vf.KeySigNote({ key: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'Bb' }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
        vf.BarNote(),
        vf.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }),
        vf.StaveNote({ keys: ['c/4'], duration: '1' }),
      ]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'all pass');
    }
  };

  return KeySignature;
}());
