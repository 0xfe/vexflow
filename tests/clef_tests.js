/**
 * VexFlow - Clef Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Clef = (function () {
  var Clef = {
    Start: function () {
      QUnit.module('Clef');
      VF.Test.runTests('Clef Test', VF.Test.Clef.draw);
      VF.Test.runTests('Clef End Test', VF.Test.Clef.drawEnd);
      VF.Test.runTests('Small Clef Test', VF.Test.Clef.drawSmall);
      VF.Test.runTests('Small Clef End Test', VF.Test.Clef.drawSmallEnd);
      VF.Test.runTests('Clef Change Test', VF.Test.Clef.drawClefChange);
    },

    draw: function (options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('treble')
        .addClef('treble', 'default', '8va')
        .addClef('treble', 'default', '8vb')
        .addClef('alto')
        .addClef('tenor')
        .addClef('soprano')
        .addClef('bass')
        .addClef('bass', 'default', '8vb')
        .addClef('mezzo-soprano')
        .addClef('baritone-c')
        .addClef('baritone-f')
        .addClef('subbass')
        .addClef('percussion')
        .addClef('french')
        .addEndClef('treble');

      vf.draw();

      ok(true, 'all pass');
    },

    drawEnd: function (options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('bass')
        .addEndClef('treble')
        .addEndClef('treble', 'default', '8va')
        .addEndClef('treble', 'default', '8vb')
        .addEndClef('alto')
        .addEndClef('tenor')
        .addEndClef('soprano')
        .addEndClef('bass')
        .addEndClef('bass', 'default', '8vb')
        .addEndClef('mezzo-soprano')
        .addEndClef('baritone-c')
        .addEndClef('baritone-f')
        .addEndClef('subbass')
        .addEndClef('percussion')
        .addEndClef('french');

      vf.draw();

      ok(true, 'all pass');
    },

    drawSmall: function (options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('treble', 'small')
        .addClef('treble', 'small', '8va')
        .addClef('treble', 'small', '8vb')
        .addClef('alto', 'small')
        .addClef('tenor', 'small')
        .addClef('soprano', 'small')
        .addClef('bass', 'small')
        .addClef('bass', 'small', '8vb')
        .addClef('mezzo-soprano', 'small')
        .addClef('baritone-c', 'small')
        .addClef('baritone-f', 'small')
        .addClef('subbass', 'small')
        .addClef('percussion', 'small')
        .addClef('french', 'small')
        .addEndClef('treble', 'small');

      vf.draw();

      ok(true, 'all pass');
    },

    drawSmallEnd: function (options) {
      var vf = VF.Test.makeFactory(options, 800, 120);

      vf.Stave()
        .addClef('bass', 'small')
        .addEndClef('treble', 'small')
        .addEndClef('treble', 'small', '8va')
        .addEndClef('treble', 'small', '8vb')
        .addEndClef('alto', 'small')
        .addEndClef('tenor', 'small')
        .addEndClef('soprano', 'small')
        .addEndClef('bass', 'small')
        .addEndClef('bass', 'small', '8vb')
        .addEndClef('mezzo-soprano', 'small')
        .addEndClef('baritone-c', 'small')
        .addEndClef('baritone-f', 'small')
        .addEndClef('subbass', 'small')
        .addEndClef('percussion', 'small')
        .addEndClef('french', 'small');

      vf.draw();

      ok(true, 'all pass');
    },

    drawClefChange: function (options) {
      var vf = VF.Test.makeFactory(options, 800, 180);
      var stave = vf.Stave().addClef('treble');

      var notes = [
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        vf.ClefNote({ type: 'alto', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'alto' }),
        vf.ClefNote({ type: 'tenor', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'tenor' }),
        vf.ClefNote({ type: 'soprano', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'soprano' }),
        vf.ClefNote({ type: 'bass', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'bass' }),
        vf.ClefNote({ type: 'mezzo-soprano', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'mezzo-soprano' }),
        vf.ClefNote({ type: 'baritone-c', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-c' }),
        vf.ClefNote({ type: 'baritone-f', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'baritone-f' }),
        vf.ClefNote({ type: 'subbass', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'subbass' }),
        vf.ClefNote({ type: 'french', options: { size: 'small' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'french' }),
        vf.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8vb' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: -1 }),
        vf.ClefNote({ type: 'treble', options: { size: 'small', annotation: '8va' } }),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble', octave_shift: 1 }),
      ];

      var voice = vf.Voice({ time: '12/4' }).addTickables(notes);

      vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'all pass');
    },
  };

  return Clef;
})();
