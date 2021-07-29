// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// PedalMarking Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit } from './declarations';

const PedalMarkingTests = {
  test(makePedal) {
    return function (options) {
      const f = VexFlowTests.makeFactory(options, 550, 200);
      const score = f.EasyScore();

      const stave0 = f.Stave({ width: 250 }).addTrebleGlyph();
      const voice0 = score.voice(score.notes('b4/4, b4, b4, b4[stem="down"]', { stem: 'up' }));
      f.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);

      const stave1 = f.Stave({ width: 260, x: 250 });
      const voice1 = score.voice(score.notes('c4/4, c4, c4, c4', { stem: 'up' }));
      f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

      makePedal(f, voice0.getTickables(), voice1.getTickables());

      f.draw();

      ok(true, 'Must render');
    };
  },

  Start() {
    const runTests = VexFlowTests.runTests;
    QUnit.module('PedalMarking');

    const test = PedalMarkingTests.test;

    function makeSimplePedal(style) {
      return function (factory, notes0, notes1) {
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
      return function (factory, notes0, notes1) {
        return factory.PedalMarking({
          notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]],
          options: { style: style },
        });
      };
    }

    runTests('Release and Depress on Same Note 1', test(makeReleaseAndDepressedPedal('bracket')));
    runTests('Release and Depress on Same Note 2', test(makeReleaseAndDepressedPedal('mixed')));

    runTests(
      'Custom Text 1',
      test(function (factory, notes0, notes1) {
        const pedal = factory.PedalMarking({
          notes: [notes0[0], notes1[3]],
          options: { style: 'text' },
        });
        pedal.setCustomText('una corda', 'tre corda');
        return pedal;
      })
    );

    runTests(
      'Custom Text 2',
      test(function (factory, notes0, notes1) {
        const pedal = factory.PedalMarking({
          notes: [notes0[0], notes1[3]],
          options: { style: 'mixed' },
        });
        pedal.setCustomText('Sost. Ped.');
        return pedal;
      })
    );
  },
};

export { PedalMarkingTests };
