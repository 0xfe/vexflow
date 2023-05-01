// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Rests Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Beam } from '../src/beam';
import { Dot } from '../src/dot';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { StaveNote, StaveNoteStruct } from '../src/stavenote';
import { Tuplet } from '../src/tuplet';
import { Voice } from '../src/voice';

const RestsTests = {
  Start(): void {
    QUnit.module('Rests');
    const run = VexFlowTests.runTests;
    run('Outside Stave', ledgerRest);
    run('Dotted', basic);
    run('Auto Align - Beamed Notes Stems Up', beamsUp);
    run('Auto Align - Beamed Notes Stems Down', beamsDown);
    run('Auto Align - Tuplets Stems Up', tupletsUp);
    run('Auto Align - Tuplets Stems Down', tupletsDown);
    run('Auto Align - Single Voice (Default)', singleVoiceDefaultAlignment);
    run('Auto Align - Single Voice (Align All)', singleVoiceAlignAll);
    run('Auto Align - Multi Voice', multiVoice);
  },
};

/**
 * Helper function to create a context and stave.
 *
 * @param options
 * @param contextBuilder static function in renderer.ts (Renderer.getSVGContext or Renderer.getCanvasContext).
 * @param width
 * @param height
 * @returns object with .context and .stave properties
 */
function setupContext(
  options: TestOptions,
  contextBuilder: ContextBuilder,
  width: number = 350,
  height: number = 150
): { context: RenderContext; stave: Stave } {
  // context is SVGContext or CanvasRenderingContext2D (native) or CanvasContext (only if Renderer.USE_CANVAS_PROXY is true).
  const context = contextBuilder(options.elementId, width, height);
  context.scale(0.9, 0.9);

  context.font = '10pt Arial';

  const stave = new Stave(10, 30, width).addClef('treble').addTimeSignature('4/4').setContext(context).draw();

  return { context, stave };
}

/**
 * Dotted rests (whole to 128th).
 * The rest duration is specified as 'wr', 'hr', ..., '128r'.
 */
function basic(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 700);

  const notes = [
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '16r' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '32r' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '64r' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '128r' }),
  ];
  Dot.buildAndAttach(notes, { all: true });

  Formatter.FormatAndDraw(context, stave, notes);

  options.assert.ok(true, 'Dotted Rest Test');
}

/**
 * Use the ledger glyph if the whole or half rest is above/below the staff
 */
function ledgerRest(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 700);

  const notes = [
    new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: 'wr' }),
    new StaveNote({ keys: ['c/6'], stem_direction: 1, duration: 'hr' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }),
    new StaveNote({ keys: ['a/3'], stem_direction: 1, duration: 'wr' }),
    new StaveNote({ keys: ['f/3'], stem_direction: 1, duration: 'hr' }),
    new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }),
  ];
  Formatter.FormatAndDraw(context, stave, notes);

  options.assert.ok(true, 'Leger/Ledger Rest Test');
}

// Optional: Use a helper function to make your code more concise.
const note = (noteStruct: StaveNoteStruct) => new StaveNote(noteStruct);

/**
 * Rests are intermixed within beamed notes (with the stems and beams at the top).
 */
function beamsUp(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 600, 160);

  const notes = [
    note({ keys: ['e/5'], stem_direction: 1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
    note({ keys: ['b/5'], stem_direction: 1, duration: '8' }),
    note({ keys: ['c/5'], stem_direction: 1, duration: '8' }),

    note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
    note({ keys: ['c/4'], stem_direction: 1, duration: '8' }),

    note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
    note({ keys: ['c/4'], stem_direction: 1, duration: '8' }),
  ];

  const beam1 = new Beam(notes.slice(0, 4));
  const beam2 = new Beam(notes.slice(4, 8));
  const beam3 = new Beam(notes.slice(8, 12));

  Formatter.FormatAndDraw(context, stave, notes);

  beam1.setContext(context).draw();
  beam2.setContext(context).draw();
  beam3.setContext(context).draw();

  options.assert.ok(true, 'Auto Align Rests - Beams Up Test');
}

/**
 * Rests are intermixed within beamed notes (with the stems and beams at the bottom).
 */
function beamsDown(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 600, 160);

  const notes = [
    note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['b/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['c/5'], stem_direction: -1, duration: '8' }),

    note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['e/4'], stem_direction: -1, duration: '8' }),

    note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['e/4'], stem_direction: -1, duration: '8' }),
  ];

  const beam1 = new Beam(notes.slice(0, 4));
  const beam2 = new Beam(notes.slice(4, 8));
  const beam3 = new Beam(notes.slice(8, 12));

  Formatter.FormatAndDraw(context, stave, notes);

  beam1.setContext(context).draw();
  beam2.setContext(context).draw();
  beam3.setContext(context).draw();

  options.assert.ok(true, 'Auto Align Rests - Beams Down Test');
}

/**
 * Call setTupletLocation(Tuplet.LOCATION_TOP) to place the tuplet indicator (bracket and number) at the
 * top of the group of notes. Tuplet.LOCATION_TOP is the default, so this is optional.
 */
function tupletsUp(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 600, 160);

  const notes = [
    note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
    note({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),

    note({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),
    note({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
    note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

    note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
    note({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),

    note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
  ];

  const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_TOP);
  const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_TOP);
  const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_TOP);
  const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

  Formatter.FormatAndDraw(context, stave, notes);

  tuplet1.setContext(context).draw();
  tuplet2.setContext(context).draw();
  tuplet3.setContext(context).draw();
  tuplet4.setContext(context).draw();

  options.assert.ok(true, 'Auto Align Rests - Tuplets Stem Up Test');
}

/**
 * Call setTupletLocation(Tuplet.LOCATION_BOTTOM) to place the tuplet indicator (bracket and number) at the
 * bottom of the group of notes.
 */
function tupletsDown(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 600, 160);

  const notes = [
    note({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

    note({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['g/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/5'], stem_direction: -1, duration: '8' }),

    note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

    note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
  ];

  const beam1 = new Beam(notes.slice(0, 3));
  const beam2 = new Beam(notes.slice(3, 6));
  const beam3 = new Beam(notes.slice(6, 9));
  const beam4 = new Beam(notes.slice(9, 12));

  const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
  const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
  const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
  const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_BOTTOM);

  Formatter.FormatAndDraw(context, stave, notes);

  tuplet1.setContext(context).draw();
  tuplet2.setContext(context).draw();
  tuplet3.setContext(context).draw();
  tuplet4.setContext(context).draw();

  beam1.setContext(context).draw();
  beam2.setContext(context).draw();
  beam3.setContext(context).draw();
  beam4.setContext(context).draw();

  options.assert.ok(true, 'Auto Align Rests - Tuplets Stem Down Test');
}

/**
 * By default rests are centered vertically within the stave, except
 * when they are inside a group of beamed notes (in which case they are
 * centered vertically within that group).
 */
function singleVoiceDefaultAlignment(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 600, 160);

  const notes = [
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    note({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
    note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

    note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
    note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

    note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
    note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

    note({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
    note({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
  ];

  const beam = new Beam(notes.slice(5, 9));
  const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

  Formatter.FormatAndDraw(context, stave, notes);

  tuplet.setContext(context).draw();
  beam.setContext(context).draw();

  options.assert.ok(true, 'Auto Align Rests - Default Test');
}

/**
 * The only difference between staveRestsAll() and staveRests() is that this test case
 * passes { align_rests: true } to Formatter.FormatAndDraw(...).
 */
function singleVoiceAlignAll(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder, 600, 160);

  const notes = [
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    note({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
    note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

    note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
    note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

    note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
    note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
    note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

    note({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
    note({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
  ];

  const beam = new Beam(notes.slice(5, 9));
  const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

  // Set { align_rests: true } to align rests (vertically) with nearby notes in each voice.
  Formatter.FormatAndDraw(context, stave, notes, { align_rests: true });

  tuplet.setContext(context).draw();
  beam.setContext(context).draw();

  options.assert.ok(true, 'Auto Align Rests - Align All Test');
}

/**
 * Multi Voice
 * The top voice shows quarter-note chords alternating with quarter rests.
 * The bottom voice shows two groups of beamed eighth notes, with eighth rests.
 */
function multiVoice(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  const stave = new Stave(50, 10, 500).addClef('treble').setContext(ctx).addTimeSignature('4/4').draw();

  const noteOnStave = (noteStruct: StaveNoteStruct) => new StaveNote(noteStruct).setStave(stave);

  const notes1 = [
    noteOnStave({ keys: ['c/4', 'e/4', 'g/4'], duration: '4' }),
    noteOnStave({ keys: ['b/4'], duration: '4r' }),
    noteOnStave({ keys: ['c/4', 'd/4', 'a/4'], duration: '4' }),
    noteOnStave({ keys: ['b/4'], duration: '4r' }),
  ];

  const notes2 = [
    noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
    noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
    noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
    noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
    noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
  ];

  const voice1 = new Voice(Flow.TIME4_4).addTickables(notes1);
  const voice2 = new Voice(Flow.TIME4_4).addTickables(notes2);

  // Set { align_rests: true } to align rests (vertically) with nearby notes in each voice.
  new Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave, { align_rests: true });

  const beam2_1 = new Beam(notes2.slice(0, 4));
  const beam2_2 = new Beam(notes2.slice(4, 8));

  // Important Note: we need to draw voice2 first, since voice2 generates ledger lines.
  // Otherwise, the ledger lines will be drawn on top of middle C notes in voice1.
  voice2.draw(ctx);
  voice1.draw(ctx);
  beam2_1.setContext(ctx).draw();
  beam2_2.setContext(ctx).draw();

  options.assert.ok(true, 'Strokes Test Multi Voice');
}

VexFlowTests.register(RestsTests);
export { RestsTests };
