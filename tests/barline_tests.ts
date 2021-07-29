/**
 * VexFlow - Barline Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
const BarlineTests = (function () {
  return {
    Start: function () {
      var run = VexFlowTests.runTests;

      QUnit.module('Barline');

      run('Simple BarNotes', function (options) {
        var f = VexFlowTests.makeFactory(options, 380, 160);
        var stave = f.Stave();

        var notes = [
          f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
          f.BarNote({ type: 'single' }),
          f
            .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
            .addAccidental(0, f.Accidental({ type: 'n' }))
            .addAccidental(1, f.Accidental({ type: '#' })),
        ];

        var voice = f.Voice().addTickables(notes);

        f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

        f.draw();

        ok(true, 'Simple Test');
      });
      run('Style BarNotes', function (options) {
        var f = VexFlowTests.makeFactory(options, 380, 160);
        var stave = f.Stave();

        var notes = [
          f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
          f.BarNote({ type: 'single' }),
          f
            .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
            .addAccidental(0, f.Accidental({ type: 'n' }))
            .addAccidental(1, f.Accidental({ type: '#' })),
        ];
        notes[1].setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

        var voice = f.Voice().addTickables(notes);

        f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

        f.draw();

        ok(true, 'Style');
      });
    },
  };
})();
VexFlowTests.Barline = BarlineTests;
export { BarlineTests };
