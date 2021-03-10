/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

function createTest(setup) {
  return function (options) {
    var vf = VF.Test.makeFactory(options, 550);
    var stave = vf.Stave();
    var score = vf.EasyScore();

    setup(vf, score);

    vf.Formatter().joinVoices(vf.getVoices()).formatToStave(vf.getVoices(), stave);

    vf.draw();

    ok(true, 'all pass');
  };
}

VF.Test.GhostNote = {
  Start: function () {
    var run = VF.Test.runTests;

    QUnit.module('GhostNote');

    run(
      'GhostNote Basic',
      createTest(function (vf, score) {
        var voice1 = score.voice(score.notes('f#5/4, f5, db5, c5, c5/8, d5, fn5, e5, d5, c5', { stem: 'up' }), {
          time: '7/4',
        });

        score.voice(
          [
            vf.GhostNote({ duration: '2' }),
            vf.StaveNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
            vf.GhostNote({ duration: '4' }),
            vf.StaveNote({ keys: ['e/4'], stem_direction: -1, duration: '4' }),
            vf.GhostNote({ duration: '8' }),
            vf
              .StaveNote({ keys: ['d/4'], stem_direction: -1, duration: '8' })
              .addAccidental(0, vf.Accidental({ type: '##' })),
            vf.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
            vf.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
          ],
          { time: '7/4' }
        );

        vf.Beam({ notes: voice1.getTickables().slice(4, 8) });
        vf.Beam({ notes: voice1.getTickables().slice(8, 10) });
      })
    );

    run(
      'GhostNote Dotted',
      createTest(function (vf, score) {
        function addAccidental(note, type) {
          note.addAccidental(0, vf.Accidental({ type: type }));
        }

        var voice1 = score.voice(
          [
            vf.GhostNote({ duration: '4d' }),
            vf.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
            vf.StaveNote({ duration: '4', keys: ['d/5'], stem_direction: 1 }),
            vf.StaveNote({ duration: '8', keys: ['c/5'], stem_direction: 1 }),
            vf.StaveNote({ duration: '16', keys: ['c/5'], stem_direction: 1 }),
            vf.StaveNote({ duration: '16', keys: ['d/5'], stem_direction: 1 }),
            vf.GhostNote({ duration: '2dd' }),
            vf.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
          ],
          { time: '8/4' }
        );

        var voice2 = score.voice(
          [
            vf.StaveNote({ duration: '4', keys: ['f/4'], stem_direction: -1 }),
            vf.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
            vf.StaveNote({ duration: '8', keys: ['d/4'], stem_direction: -1 }),
            vf.GhostNote({ duration: '4dd' }),
            vf.StaveNote({ duration: '16', keys: ['c/4'], stem_direction: -1 }),
            vf.StaveNote({ duration: '2', keys: ['c/4'], stem_direction: -1 }),
            vf.StaveNote({ duration: '4', keys: ['d/4'], stem_direction: -1 }),
            vf.StaveNote({ duration: '8', keys: ['f/4'], stem_direction: -1 }),
            vf.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
          ],
          { time: '8/4' }
        );

        var notes1 = voice1.getTickables();
        var notes2 = voice2.getTickables();

        addAccidental(notes1[1], 'bb');
        addAccidental(notes1[4], '#');
        addAccidental(notes1[7], 'n');

        addAccidental(notes2[0], '#');
        addAccidental(notes2[4], 'b');
        addAccidental(notes2[5], '#');
        addAccidental(notes2[7], 'n');

        vf.Beam({ notes: notes1.slice(3, 6) });
        vf.Beam({ notes: notes2.slice(1, 3) });
        vf.Beam({ notes: notes2.slice(7, 9) });
      })
    );
  },
};
