/**
 * VexFlow - Curve Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Curve = (function () {
  function concat(a, b) {
    return a.concat(b);
  }

  function createTest(beamGroup1, beamGroup2, setupCurves) {
    return function (options) {
      var vf = VF.Test.makeFactory(options, 350, 200);
      var stave = vf.Stave({ y: 50 });
      var score = vf.EasyScore();

      var notes = [
        score.beam(score.notes.apply(score, beamGroup1)),
        score.beam(score.notes.apply(score, beamGroup2)),
      ].reduce(concat);

      setupCurves(vf, notes);

      var voice = score.voice(notes, { time: '4/4' });

      vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok('Simple Curve');
    };
  }

  return {
    Start: function () {
      var run = VF.Test.runTests;

      QUnit.module('Curve');

      run(
        'Simple Curve',
        createTest(['c4/8, f5, d5, g5', { stem: 'up' }], ['d6/8, f5, d5, g5', { stem: 'down' }], function (vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[3],
            options: {
              cps: [
                { x: 0, y: 10 },
                { x: 0, y: 50 },
              ],
            },
          });

          vf.Curve({
            from: notes[4],
            to: notes[7],
            options: {
              cps: [
                { x: 0, y: 10 },
                { x: 0, y: 20 },
              ],
            },
          });
        })
      );

      run(
        'Rounded Curve',
        createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], function (vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[3],
            options: {
              x_shift: -10,
              y_shift: 30,
              cps: [
                { x: 0, y: 20 },
                { x: 0, y: 50 },
              ],
            },
          });

          vf.Curve({
            from: notes[4],
            to: notes[7],
            options: {
              cps: [
                { x: 0, y: 50 },
                { x: 0, y: 50 },
              ],
            },
          });
        })
      );

      run(
        'Thick Thin Curves',
        createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], function (vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[3],
            options: {
              thickness: 10,
              x_shift: -10,
              y_shift: 30,
              cps: [
                { x: 0, y: 20 },
                { x: 0, y: 50 },
              ],
            },
          });

          vf.Curve({
            from: notes[4],
            to: notes[7],
            options: {
              thickness: 0,
              cps: [
                { x: 0, y: 50 },
                { x: 0, y: 50 },
              ],
            },
          });
        })
      );

      run(
        'Top Curve',
        createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], function (vf, notes) {
          vf.Curve({
            from: notes[0],
            to: notes[7],
            options: {
              x_shift: -3,
              y_shift: 10,
              position: VF.Curve.Position.NEAR_TOP,
              position_end: VF.Curve.Position.NEAR_HEAD,
              cps: [
                { x: 0, y: 20 },
                { x: 40, y: 80 },
              ],
            },
          });
        })
      );
    },
  };
})();
