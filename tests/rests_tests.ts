// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { Vex } from 'vex';
import { QUnit, ok } from './declarations';
import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { RenderContext } from 'types/common';
import { Flow } from 'flow';
import { StaveNoteStruct } from 'stavenote';
import { Stave } from 'stave';
import { ContextBuilder } from 'renderer';

const VF: any = Vex.Flow;

// Optional: arrow function to make your code more concise.
const note = (s: StaveNoteStruct) => new VF.StaveNote(s);

const RestsTests = {
  Start: function (): void {
    QUnit.module('Rests');
    const runTests = VexFlowTests.runTests;
    runTests('Dotted', RestsTests.basic);
    runTests('Auto Align - Beamed Notes Stems Up', RestsTests.beamsUp);
    runTests('Auto Align - Beamed Notes Stems Down', RestsTests.beamsDown);
    runTests('Auto Align - Tuplets Stems Up', RestsTests.tupletsUp);
    runTests('Auto Align - Tuplets Stems Down', RestsTests.tupletsDown);
    runTests('Auto Align - Single Voice (Default)', RestsTests.singleVoiceDefaultAlignment);
    runTests('Auto Align - Single Voice (Align All)', RestsTests.singleVoiceAlignAll);
    runTests('Auto Align - Multi Voice', RestsTests.multiVoice);
  },

  /**
   * @param options
   * @param contextBuilder static function in renderer.ts (Renderer.getSVGContext or Renderer.getCanvasContext).
   * @param width
   * @param height
   * @returns object with .context and .stave properties
   */
  setupContext: function (
    options: TestOptions,
    contextBuilder: ContextBuilder,
    width: number = 350,
    height: number = 150
  ): { context: RenderContext; stave: Stave } {
    // ctx is SVGContext or CanvasRenderingContext2D (native) or CanvasContext (only if Renderer.USE_CANVAS_PROXY is true).
    const ctx = contextBuilder(options.elementId, width, height);
    ctx.scale(0.9, 0.9);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = ' 10pt Arial';

    const stave = new VF.Stave(10, 30, width).addTrebleGlyph().addTimeSignature('4/4').setContext(ctx).draw();

    return {
      context: ctx,
      stave: stave,
    };
  },

  /**
   * Eight dotted rests, from whole to 128th.
   * @param options
   * @param contextBuilder
   */
  basic(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 700);

    const notes = [
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }).addDotToAll(),
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }).addDotToAll(),
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }).addDotToAll(),
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }).addDotToAll(),
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '16r' }).addDotToAll(),
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '32r' }).addDotToAll(),
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '64r' }).addDotToAll(),
      // TODO: 128th rests' dot location seem to be wrong.
      new VF.StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '128r' }).addDotToAll(),
    ];

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    ok(true, 'Dotted Rest Test');
  },

  /**
   * Rests are intermixed within beamed notes (with the stems and beams at the top).
   * @param options
   * @param contextBuilder
   */
  beamsUp(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

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

    const beam1 = new VF.Beam(notes.slice(0, 4));
    const beam2 = new VF.Beam(notes.slice(4, 8));
    const beam3 = new VF.Beam(notes.slice(8, 12));

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    beam1.setContext(c.context).draw();
    beam2.setContext(c.context).draw();
    beam3.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Beams Up Test');
  },

  /**
   * Rests are intermixed within beamed notes (with the stems and beams at the bottom).
   *
   * @param options
   * @param contextBuilder
   */
  beamsDown(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

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

    const beam1 = new VF.Beam(notes.slice(0, 4));
    const beam2 = new VF.Beam(notes.slice(4, 8));
    const beam3 = new VF.Beam(notes.slice(8, 12));

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    beam1.setContext(c.context).draw();
    beam2.setContext(c.context).draw();
    beam3.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Beams Down Test');
  },

  /**
   * Call setTupletLocation(Tuplet.LOCATION_TOP) to place the tuplet indicator (bracket and number) at the
   * top of the group of notes. Tuplet.LOCATION_TOP is the default, so this is optional.
   *
   * @param options
   * @param contextBuilder
   */
  tupletsUp(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

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

    const tuplet1 = new VF.Tuplet(notes.slice(0, 3)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
    const tuplet2 = new VF.Tuplet(notes.slice(3, 6)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
    const tuplet3 = new VF.Tuplet(notes.slice(6, 9)).setTupletLocation(VF.Tuplet.LOCATION_TOP);
    const tuplet4 = new VF.Tuplet(notes.slice(9, 12)).setTupletLocation(VF.Tuplet.LOCATION_TOP);

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    tuplet1.setContext(c.context).draw();
    tuplet2.setContext(c.context).draw();
    tuplet3.setContext(c.context).draw();
    tuplet4.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Tuplets Stem Up Test');
  },

  /**
   * Call setTupletLocation(Tuplet.LOCATION_BOTTOM) to place the tuplet indicator (bracket and number) at the
   * bottom of the group of notes.
   *
   * @param options
   * @param contextBuilder
   */
  tupletsDown(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

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

    const beam1 = new VF.Beam(notes.slice(0, 3));
    const beam2 = new VF.Beam(notes.slice(3, 6));
    const beam3 = new VF.Beam(notes.slice(6, 9));
    const beam4 = new VF.Beam(notes.slice(9, 12));

    const tuplet1 = new VF.Tuplet(notes.slice(0, 3)).setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
    const tuplet2 = new VF.Tuplet(notes.slice(3, 6)).setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
    const tuplet3 = new VF.Tuplet(notes.slice(6, 9)).setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);
    const tuplet4 = new VF.Tuplet(notes.slice(9, 12)).setTupletLocation(VF.Tuplet.LOCATION_BOTTOM);

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    tuplet1.setContext(c.context).draw();
    tuplet2.setContext(c.context).draw();
    tuplet3.setContext(c.context).draw();
    tuplet4.setContext(c.context).draw();

    beam1.setContext(c.context).draw();
    beam2.setContext(c.context).draw();
    beam3.setContext(c.context).draw();
    beam4.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Tuplets Stem Down Test');
  },

  /**
   * By default rests are centered vertically within the stave, except
   * when they are inside a group of beamed notes (in which case they are
   * centered vertically within that group).
   *
   * @param options
   * @param contextBuilder
   */
  singleVoiceDefaultAlignment(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

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

    const beam = new VF.Beam(notes.slice(5, 9));
    const tuplet = new VF.Tuplet(notes.slice(9, 12)).setTupletLocation(VF.Tuplet.LOCATION_TOP);

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    tuplet.setContext(c.context).draw();
    beam.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Default Test');
  },

  /**
   * The only difference between staveRestsAll() and staveRests() is that this test case
   * passes { align_rests: true } to Formatter.FormatAndDraw(...).
   *
   * @param options
   * @param contextBuilder
   */
  singleVoiceAlignAll(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

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

    const beam = new VF.Beam(notes.slice(5, 9));
    const tuplet = new VF.Tuplet(notes.slice(9, 12)).setTupletLocation(VF.Tuplet.LOCATION_TOP);

    // Set { align_rests: true } to align rests (vertically) with nearby notes in each voice.
    Formatter.FormatAndDraw(c.context, c.stave, notes, { align_rests: true });

    tuplet.setContext(c.context).draw();
    beam.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Align All Test');
  },

  /**
   * Multi Voice
   * The top voice shows quarter-note chords alternating with quarter rests.
   * The bottom voice shows two groups of beamed eighth notes, with eighth rests.
   *
   * @param options
   * @param contextBuilder
   */
  multiVoice(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 600, 200);
    const stave = new VF.Stave(50, 10, 500).addClef('treble').setContext(ctx).addTimeSignature('4/4').draw();

    const noteOnStave = (s: StaveNoteStruct) => new VF.StaveNote(s).setStave(stave);

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

    const voice1 = new VF.Voice(Flow.TIME4_4).addTickables(notes1);
    const voice2 = new VF.Voice(Flow.TIME4_4).addTickables(notes2);

    // Set { align_rests: true } to align rests (vertically) with nearby notes in each voice.
    new VF.Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave, { align_rests: true });

    const beam2_1 = new VF.Beam(notes2.slice(0, 4));
    const beam2_2 = new VF.Beam(notes2.slice(4, 8));

    // Important Note: we need to draw voice2 first, since voice2 generates ledger lines.
    // Otherwise, the ledger lines will be drawn on top of middle C notes in voice1.
    voice2.draw(ctx);
    voice1.draw(ctx);
    beam2_1.setContext(ctx).draw();
    beam2_2.setContext(ctx).draw();

    ok(true, 'Strokes Test Multi Voice');
  },
};

export { RestsTests };
