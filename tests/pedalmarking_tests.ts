// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// PedalMarking Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok } from './declarations';

function createTest(makePedal) {
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
}

function withSimplePedal(style) {
  return function (factory, notes0, notes1) {
    return factory.PedalMarking({
      notes: [notes0[0], notes0[2], notes0[3], notes1[3]],
      options: { style: style },
    });
  };
}

function withReleaseAndDepressedPedal(style) {
  return function (factory, notes0, notes1) {
    return factory.PedalMarking({
      notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]],
      options: { style: style },
    });
  };
}

const PedalMarkingTests = {
  Start(): void {
    QUnit.module('PedalMarking');

    const run = VexFlowTests.runTests;
    run('Simple Pedal 1', createTest(withSimplePedal('text')));
    run('Simple Pedal 2', createTest(withSimplePedal('bracket')));
    run('Simple Pedal 3', createTest(withSimplePedal('mixed')));
    run('Release and Depress on Same Note 1', createTest(withReleaseAndDepressedPedal('bracket')));
    run('Release and Depress on Same Note 2', createTest(withReleaseAndDepressedPedal('mixed')));

    run(
      'Custom Text 1',
      createTest(function (factory, notes0, notes1) {
        const pedal = factory.PedalMarking({
          notes: [notes0[0], notes1[3]],
          options: { style: 'text' },
        });
        pedal.setCustomText('una corda', 'tre corda');
        return pedal;
      })
    );

    run(
      'Custom Text 2',
      createTest(function (factory, notes0, notes1) {
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
