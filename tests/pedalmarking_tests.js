/**
 * VexFlow - PedalMarking Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.PedalMarking = (function() {
  var PedalMarking = {
    test: function(makePedal) {
      return function(options) {
        var vf = VF.Test.makeFactory(options, 550, 200);
        var score = vf.EasyScore();

        var stave0 = vf.Stave({ width: 250 }).addTrebleGlyph();
        var voice0 = score.voice(score.notes('b4/4, b4, b4, b4[stem="down"]', { stem: 'up' }));
        vf.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);

        var stave1 = vf.Stave({ width: 260, x: 250 });
        var voice1 = score.voice(score.notes('c4/4, c4, c4, c4', { stem: 'up' }));
        vf.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

        makePedal(vf, voice0.getTickables(), voice1.getTickables());

        vf.draw();

        ok(true, 'Must render');
      };
    },

    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module('PedalMarking');

      var test = PedalMarking.test;

      function makeSimplePedal(style) {
        return function(factory, notes0, notes1) {
          return factory.PedalMarking({
            notes: [notes0[0], notes0[2], notes0[3], notes1[3]],
            options: { style: style },
          });
        };
      }

      runTests('Simple Pedal 1', test(makeSimplePedal('text')));
      runTests('Simple Pedal 2', test(makeSimplePedal('bracket')));
      runTests('Simple Pedal 3', test(makeSimplePedal('mixed')));

      function makeReleaseAndDepressedPedal(style) {
        return function(factory, notes0, notes1) {
          return factory.PedalMarking({
            notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]],
            options: { style: style },
          });
        };
      }

      runTests('Release and Depress on Same Note 1', test(makeReleaseAndDepressedPedal('bracket')));
      runTests('Release and Depress on Same Note 2', test(makeReleaseAndDepressedPedal('mixed')));

      runTests('Custom Text 1', test(function(factory, notes0, notes1) {
        var pedal = factory.PedalMarking({
          notes: [notes0[0], notes1[3]],
          options: { style: 'text' },
        });
        pedal.setCustomText('una corda', 'tre corda');
        return pedal;
      }));

      runTests('Custom Text 2', test(function(factory, notes0, notes1) {
        var pedal = factory.PedalMarking({
          notes: [notes0[0], notes1[3]],
          options: { style: 'mixed' },
        });
        pedal.setCustomText('Sost. Ped.');
        return pedal;
      }));
    },
  };

  return PedalMarking;
})();
