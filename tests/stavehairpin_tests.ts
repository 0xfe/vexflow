// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Raffaele Viglianti, 2012
//
// StaveHairpin Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { QUnit, ok } from './types/qunit';
import { StaveHairpin } from 'stavehairpin';

function drawHairpin(from, to, stave, ctx, type, position, options?) {
  const hairpin = new StaveHairpin({ first_note: from, last_note: to }, type);
  hairpin.setContext(ctx);
  hairpin.setPosition(position);
  if (options) {
    hairpin.setRenderOptions(options);
  }
  hairpin.draw();
}

function createTest(drawHairpins) {
  return function (options: TestOptions) {
    const f = VexFlowTests.makeFactory(options);
    const ctx = f.getContext();
    const stave = f.Stave();

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addAccidental(0, f.Accidental({ type: 'b' }))
        .addAccidental(1, f.Accidental({ type: '#' })),
      f.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
      f.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      f.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
    ];

    const voice = f.Voice().addTickables(notes);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    drawHairpins(ctx, stave, notes);

    ok(true, 'Simple Test');
  };
}

const StaveHairpinTests = {
  Start(): void {
    QUnit.module('StaveHairpin');
    const run = VexFlowTests.runTests;

    run(
      'Simple StaveHairpin',
      createTest(function (ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 4);
        drawHairpin(notes[1], notes[3], stave, ctx, 2, 3);
      })
    );

    run(
      'Horizontal Offset StaveHairpin',
      createTest(function (ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 3, {
          height: 10,
          vo: 20, // vertical offset
          left_ho: 20, // left horizontal offset
          right_ho: -20, // right horizontal offset
        });
        drawHairpin(notes[3], notes[3], stave, ctx, 2, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 120, // right horizontal offset
        });
      })
    );

    run(
      'Vertical Offset StaveHairpin',
      createTest(function (ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
        drawHairpin(notes[2], notes[3], stave, ctx, 2, 4, {
          height: 10,
          y_shift: -15, // vertical offset
          left_shift_px: 2, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
      })
    );

    run(
      'Height StaveHairpin',
      createTest(function (ctx, stave, notes) {
        drawHairpin(notes[0], notes[2], stave, ctx, 1, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
        drawHairpin(notes[2], notes[3], stave, ctx, 2, 4, {
          height: 15,
          y_shift: 0, // vertical offset
          left_shift_px: 2, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
      })
    );
  },
};
export { StaveHairpinTests };
