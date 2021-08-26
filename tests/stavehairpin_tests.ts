// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Raffaele Viglianti, 2012
//
// StaveHairpin Tests

/* eslint-disable */
// @ts-nocheck

// TODO: Incorrect property names in the options object: vo, left_ho, right_ho.
// TODO: StaveHairpin.setRenderOptions() should take a Partial<StaveHairpinRenderOptions>.

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { RenderContext } from 'types/common';
import { StaveHairpin, StaveHairpinRenderOptions } from 'stavehairpin';
import { StaveNote } from 'stavenote';

const StaveHairpinTests = {
  Start(): void {
    QUnit.module('StaveHairpin');
    const run = VexFlowTests.runTests;
    run('Simple StaveHairpin', this.simple);
    run('Horizontal Offset StaveHairpin', this.horizontal);
    run('Vertical Offset StaveHairpin', this.vertical);
    run('Height StaveHairpin', this.height);
  },

  simple: createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 4);
    drawHairpin(notes[1], notes[3], ctx, 2, 3);
  }),

  horizontal: createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 3, {
      height: 10,
      // TODO: these three property names seem to be incorrect.
      // vo => should it be 'y_shift'?
      // left_ho => should it be 'left_shift_px'?
      // right_ho => should it be 'right_shift_px'?
      vo: 20, // vertical offset
      left_ho: 20, // left horizontal offset
      right_ho: -20, // right horizontal offset
    });
    drawHairpin(notes[3], notes[3], ctx, 2, 4, {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 120, // right horizontal offset
    });
  }),

  vertical: createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 4, {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });
    drawHairpin(notes[2], notes[3], ctx, 2, 4, {
      height: 10,
      y_shift: -15, // vertical offset
      left_shift_px: 2, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });
  }),

  height: createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 4, {
      height: 10,
      y_shift: 0, // vertical offset
      left_shift_px: 0, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });
    drawHairpin(notes[2], notes[3], ctx, 2, 4, {
      height: 15,
      y_shift: 0, // vertical offset
      left_shift_px: 2, // left horizontal offset
      right_shift_px: 0, // right horizontal offset
    });
  }),
};

function drawHairpin(
  from: StaveNote,
  to: StaveNote,
  ctx: RenderContext,
  type: number,
  position: number,
  options?: Partial<StaveHairpinRenderOptions>
) {
  const hairpin = new StaveHairpin({ first_note: from, last_note: to }, type);
  hairpin.setContext(ctx);
  hairpin.setPosition(position);
  if (options) {
    hairpin.setRenderOptions(options);
  }
  hairpin.draw();
}

function createTest(drawHairpins: (ctx: RenderContext, notes: StaveNote[]) => void) {
  return (options: TestOptions) => {
    const factory = VexFlowTests.makeFactory(options);
    const ctx = factory.getContext();
    const stave = factory.Stave();

    const notes = [
      factory
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addAccidental(0, factory.Accidental({ type: 'b' }))
        .addAccidental(1, factory.Accidental({ type: '#' })),
      factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
    ];

    const voice = factory.Voice().addTickables(notes);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();

    drawHairpins(ctx, notes);

    ok(true, 'Simple Test');
  };
}

export { StaveHairpinTests };
