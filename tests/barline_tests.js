/**
 * VexFlow - Barline Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
const BarlineTests = (function () {
  return {
    Start: function () {
      var run = VF.Test.runTests;

      QUnit.module('Barline');

      run('Simple BarNotes', function (options) {
        var vf = VF.Test.makeFactory(options, 380, 160);
        var stave = vf.Stave();

        var notes = [
          vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
          vf.BarNote({ type: 'single' }),
          vf
            .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
            .addAccidental(0, vf.Accidental({ type: 'n' }))
            .addAccidental(1, vf.Accidental({ type: '#' })),
        ];

        var voice = vf.Voice().addTickables(notes);

        vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

        vf.draw();

        ok(true, 'Simple Test');
      });
      run('Style BarNotes', function (options) {
        var vf = VF.Test.makeFactory(options, 380, 160);
        var stave = vf.Stave();

        var notes = [
          vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
          vf.BarNote({ type: 'single' }),
          vf
            .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
            .addAccidental(0, vf.Accidental({ type: 'n' }))
            .addAccidental(1, vf.Accidental({ type: '#' })),
        ];
        notes[1].setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

        var voice = vf.Voice().addTickables(notes);

        vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

        vf.draw();

        ok(true, 'Style');
      });
    },
  };
})();
VF.Test.Barline = BarlineTests;
export { BarlineTests };
