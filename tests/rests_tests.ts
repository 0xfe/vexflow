/**
 * VexFlow - Rest Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
import { QUnit, ok, Assert } from './declarations';
import { VexFlowTests } from './vexflow_test_helpers';
import { RenderContext } from '../src/types/common';
import { Flow } from '../src/flow';
import { StaveNoteStruct } from '../src/stavenote';
import { Stave } from '../src/stave';
import { StaveNote } from '../src/stavenote';
import { Beam } from '../src/beam';
import { Tuplet } from '../src/tuplet';
import { Formatter } from '../src/formatter';
import { Voice } from '../src/voice';

// TODO: Move to renderer.ts or maybe vexflow_test_helpers.ts
// A ContextBuilder is a static function either Renderer.getSVGContext or Renderer.getCanvasContext.
type ContextBuilder = (elementId: string, width: number, height: number, background?: string) => RenderContext;

// TODO: Move to vexflow_test_helpers.ts
interface TestOptions {
  elementId: string;
  backend: number;
  assert: Assert;
  // eslint-disable-next-line
  params: any;
}

const RestsTests = {
  Start: function (): void {
    QUnit.module('Rests');
    VexFlowTests.runTests('Rests - Dotted', RestsTests.basic);
    VexFlowTests.runTests('Auto Align Rests - Beamed Notes Stems Up', RestsTests.beamsUp);
    VexFlowTests.runTests('Auto Align Rests - Beamed Notes Stems Down', RestsTests.beamsDown);
    VexFlowTests.runTests('Auto Align Rests - Tuplets Stems Up', RestsTests.tuplets);
    VexFlowTests.runTests('Auto Align Rests - Tuplets Stems Down', RestsTests.tupletsdown);
    VexFlowTests.runTests('Auto Align Rests - Single Voice (Default)', RestsTests.staveRests);
    VexFlowTests.runTests('Auto Align Rests - Single Voice (Align All)', RestsTests.staveRestsAll);
    VexFlowTests.runTests('Auto Align Rests - Multi Voice', RestsTests.multi);
  },

  /**
   * @param options
   * @param contextBuilder static function in renderer.ts (Renderer.getSVGContext or Renderer.getCanvasContext).
   * @param width
   * @param height
   * @returns
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

    const stave = new Stave(10, 30, width).addTrebleGlyph().addTimeSignature('4/4').setContext(ctx).draw();

    return {
      context: ctx,
      stave: stave,
    };
  },

  basic: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 700);

    const notes = [
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }).addDotToAll(),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }).addDotToAll(),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }).addDotToAll(),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }).addDotToAll(),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '16r' }).addDotToAll(),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '32r' }).addDotToAll(),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '64r' }).addDotToAll(),
    ];

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    ok(true, 'Dotted Rest Test');
  },

  beamsUp: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

    const notes = [
      new StaveNote({ keys: ['e/5'], stem_direction: 1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      new StaveNote({ keys: ['b/5'], stem_direction: 1, duration: '8' }),
      new StaveNote({ keys: ['c/5'], stem_direction: 1, duration: '8' }),

      new StaveNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      new StaveNote({ keys: ['c/4'], stem_direction: 1, duration: '8' }),

      new StaveNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
      new StaveNote({ keys: ['c/4'], stem_direction: 1, duration: '8' }),
    ];

    const beam1 = new Beam(notes.slice(0, 4));
    const beam2 = new Beam(notes.slice(4, 8));
    const beam3 = new Beam(notes.slice(8, 12));

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    beam1.setContext(c.context).draw();
    beam2.setContext(c.context).draw();
    beam3.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Beams Up Test');
  },

  beamsDown: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

    const notes = [
      new StaveNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['b/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['c/5'], stem_direction: -1, duration: '8' }),

      new StaveNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['e/4'], stem_direction: -1, duration: '8' }),

      new StaveNote({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['e/4'], stem_direction: -1, duration: '8' }),
    ];

    const beam1 = new Beam(notes.slice(0, 4));
    const beam2 = new Beam(notes.slice(4, 8));
    const beam3 = new Beam(notes.slice(8, 12));

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    beam1.setContext(c.context).draw();
    beam2.setContext(c.context).draw();
    beam3.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Beams Down Test');
  },

  tuplets: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

    const notes = [
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
      new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),

      new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),
      new StaveNote({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
      new StaveNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

      new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
      new StaveNote({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4' }),

      new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
    ];

    const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    tuplet1.setContext(c.context).draw();
    tuplet2.setContext(c.context).draw();
    tuplet3.setContext(c.context).draw();
    tuplet4.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Tuplets Stem Up Test');
  },

  tupletsdown: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

    const notes = [
      new StaveNote({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

      new StaveNote({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['b/5'], stem_direction: -1, duration: '8' }),

      new StaveNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),

      new StaveNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    ];

    const beam1 = new Beam(notes.slice(0, 3));
    const beam2 = new Beam(notes.slice(3, 6));
    const beam3 = new Beam(notes.slice(6, 9));
    const beam4 = new Beam(notes.slice(9, 12));

    const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_BOTTOM);

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

  staveRests: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

    const notes = [
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      new StaveNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
      new StaveNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),

      new StaveNote({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
      new StaveNote({ keys: ['e/5'], stem_direction: -1, duration: '8' }),

      new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
      new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
      new StaveNote({ keys: ['b/5'], stem_direction: 1, duration: '4' }),

      new StaveNote({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
      new StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
      new StaveNote({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    ];

    const beam1 = new Beam(notes.slice(5, 9));
    const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

    Formatter.FormatAndDraw(c.context, c.stave, notes);

    tuplet.setContext(c.context).draw();
    beam1.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Default Test');
  },

  staveRestsAll: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = RestsTests.setupContext(options, contextBuilder, 600, 160);

    // Optionally use a shortcut arrow function to make your code more concise.
    const note = (s: StaveNoteStruct) => new StaveNote(s);

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

    const beam1 = new Beam(notes.slice(5, 9));
    const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);

    // Set option to position rests near the notes in the voice
    Formatter.FormatAndDraw(c.context, c.stave, notes, { align_rests: true });

    tuplet.setContext(c.context).draw();
    beam1.setContext(c.context).draw();

    ok(true, 'Auto Align Rests - Align All Test');
  },

  multi: function (options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 600, 200);
    const stave = new Stave(50, 10, 500).addClef('treble').setContext(ctx).addTimeSignature('4/4').draw();

    const noteOnStave = (s: StaveNoteStruct) => new StaveNote(s).setStave(stave);

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

    // Set option to position rests near the notes in each voice
    new Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave, { align_rests: true });

    const beam2_1 = new Beam(notes2.slice(0, 4));
    const beam2_2 = new Beam(notes2.slice(4, 8));

    voice2.draw(ctx);
    voice1.draw(ctx);
    beam2_1.setContext(ctx).draw();
    beam2_2.setContext(ctx).draw();

    ok(true, 'Strokes Test Multi Voice');
  },
};

export { RestsTests };
