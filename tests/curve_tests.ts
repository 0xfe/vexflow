// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Curve Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, concat, TestOptions } from './vexflow_test_helpers';
import { Curve } from 'curve';
import { Factory } from 'factory';
import { StaveNote } from 'stavenote';

function createTest(beamGroup1, beamGroup2, setupCurves: (f: Factory, n: StaveNote[]) => void) {
  return (options: TestOptions) => {
    const f = VexFlowTests.makeFactory(options, 350, 200);
    const stave = f.Stave({ y: 50 });
    const score = f.EasyScore();

    const notes: StaveNote[] = [
      score.beam(score.notes.apply(score, beamGroup1)),
      score.beam(score.notes.apply(score, beamGroup2)),
    ].reduce(concat);

    setupCurves(f, notes);

    const voice = score.voice(notes, { time: '4/4' });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok('Simple Curve');
  };
}

const CurveTests = {
  Start(): void {
    QUnit.module('Curve');
    const run = VexFlowTests.runTests;

    run(
      'Simple Curve',
      createTest(['c4/8, f5, d5, g5', { stem: 'up' }], ['d6/8, f5, d5, g5', { stem: 'down' }], function (f, notes) {
        f.Curve({
          from: notes[0],
          to: notes[3],
          options: {
            cps: [
              { x: 0, y: 10 },
              { x: 0, y: 50 },
            ],
          },
        });

        f.Curve({
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
      createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], function (f, notes) {
        f.Curve({
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

        f.Curve({
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
      createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], function (f, notes) {
        f.Curve({
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

        f.Curve({
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
      createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], function (f, notes) {
        f.Curve({
          from: notes[0],
          to: notes[7],
          options: {
            x_shift: -3,
            y_shift: 10,
            position: Curve.Position.NEAR_TOP,
            position_end: Curve.Position.NEAR_HEAD,
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

export { CurveTests };
