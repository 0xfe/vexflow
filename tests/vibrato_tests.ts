// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Vibrato Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Bend, ContextBuilder, Font, Formatter, TabNote, TabNoteStruct, TabStave, Vibrato } from '../src/index';

const VibratoTests = {
  Start(): void {
    QUnit.module('Vibrato');
    const run = VexFlowTests.runTests;
    run('Vibrato with Bend', withBend);
    run('Simple Vibrato', simple);
    run('Harsh Vibrato', harsh);
    run('Vibrato with Bend', withBend);
  },
};

// Helper function to create TabNote objects.
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

/**
 * Default vibrato symbol (wavy line) on top of a tab with two notes fretted.
 */
function simple(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

  const notes = [
    tabNote({
      positions: [
        { str: 2, fret: 10 },
        { str: 4, fret: 9 },
      ],
      duration: 'h',
    }).addModifier(0, new Vibrato()),
    tabNote({
      positions: [{ str: 2, fret: 10 }],
      duration: 'h',
    }).addModifier(0, new Vibrato()),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Simple Vibrato');
}

/**
 * The harsh vibrato symbol is a zig zag line with sharp points.
 * This test is nearly identical to the 'simple' test above.
 * The only difference is that we call .setHarsh(true) on each Vibrato object.
 */
function harsh(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

  const notes = [
    tabNote({
      positions: [
        { str: 2, fret: 10 },
        { str: 4, fret: 9 },
      ],
      duration: 'h',
    }).addModifier(0, new Vibrato().setHarsh(true)),
    tabNote({
      positions: [{ str: 2, fret: 10 }],
      duration: 'h',
    }).addModifier(0, new Vibrato().setHarsh(true)),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Harsh Vibrato');
}

function withBend(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.3, 1.3);
  ctx.setFillStyle('#221');
  ctx.setStrokeStyle('#221');
  ctx.setFont(Font.SANS_SERIF, VexFlowTests.Font.size);
  const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

  const notes = [
    tabNote({
      positions: [
        { str: 2, fret: 9 },
        { str: 3, fret: 9 },
      ],
      duration: 'q',
    })
      .addModifier(0, new Bend('1/2', true))
      .addModifier(1, new Bend('1/2', true))
      .addModifier(0, new Vibrato()),
    tabNote({
      positions: [{ str: 2, fret: 10 }],
      duration: 'q',
    })
      .addModifier(0, new Vibrato().setVibratoWidth(60))
      .addModifier(0, new Bend('Full', false)),
    tabNote({
      positions: [{ str: 2, fret: 10 }],
      duration: 'h',
    }).addModifier(0, new Vibrato().setVibratoWidth(120).setHarsh(true)),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Vibrato with Bend');
}

VexFlowTests.register(VibratoTests);
export { VibratoTests };
