// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Mike Corrigan 2012 <corrigan@gmail.com>
//
// Percussion Tests

// TODO: Type 'Tickable[]' is not assignable to type 'StemmableNote[]'.

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import {
  ContextBuilder,
  Dot,
  Factory,
  Font,
  FontStyle,
  FontWeight,
  RenderContext,
  Stave,
  StaveNote,
  StaveNoteStruct,
  StemmableNote,
  TickContext,
  Tremolo,
} from '../src/index';

const PercussionTests = {
  Start(): void {
    QUnit.module('Percussion');
    const run = VexFlowTests.runTests;
    run('Percussion Clef', draw);
    run('Percussion Notes', drawNotes);
    run('Percussion Basic0', basic0);
    run('Percussion Basic1', basic1);
    run('Percussion Basic2', basic2);
    run('Percussion Snare0', snare0);
    run('Percussion Snare1', snare1);
    run('Percussion Snare2', snare2);
    run('Percussion Snare3', snare3);
  },
};

function draw(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 120);
  new Stave(10, 10, 300).addClef('percussion').setContext(ctx).draw();
  ok(true);
}

/**
 * Helper function used by the drawNotes() test case below.
 */
function showNote(struct: StaveNoteStruct, stave: Stave, ctx: RenderContext, x: number): StaveNote {
  const staveNote = new StaveNote(struct).setStave(stave);
  new TickContext().addTickable(staveNote).preFormat().setX(x);
  staveNote.setContext(ctx).draw();
  return staveNote;
}

function drawNotes(options: TestOptions, contextBuilder: ContextBuilder): void {
  const notes: StaveNoteStruct[] = [
    { keys: ['g/5/d0'], duration: '4' },
    { keys: ['g/5/d1'], duration: '4' },
    { keys: ['g/5/d2'], duration: '4' },
    { keys: ['g/5/d3'], duration: '4' },
    { keys: ['x/'], duration: '1' },

    { keys: ['g/5/t0'], duration: '1' },
    { keys: ['g/5/t1'], duration: '4' },
    { keys: ['g/5/t2'], duration: '4' },
    { keys: ['g/5/t3'], duration: '4' },
    { keys: ['x/'], duration: '1' },

    { keys: ['g/5/x0'], duration: '1' },
    { keys: ['g/5/x1'], duration: '4' },
    { keys: ['g/5/x2'], duration: '4' },
    { keys: ['g/5/x3'], duration: '4' },
  ];

  const ctx = contextBuilder(options.elementId, notes.length * 25 + 100, 240);

  // Draw two staves, one with up-stems and one with down-stems.
  for (let h = 0; h < 2; ++h) {
    const stave = new Stave(10, 10 + h * 120, notes.length * 25 + 75).addClef('percussion').setContext(ctx).draw();

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      note.stem_direction = h === 0 ? -1 : 1;
      const staveNote = showNote(note, stave, ctx, (i + 1) * 25);

      ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
      ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
    }
  }
}

/**
 * Helper function for the seven test cases below.
 * Adds a percussion clef (two short vertical bars, like a pause sign) to the stave.
 */
function createSingleMeasureTest(setup: (f: Factory) => void) {
  return (options: TestOptions): void => {
    const f = VexFlowTests.makeFactory(options, 500);
    const stave = f.Stave().addClef('percussion').setTimeSignature('4/4');
    setup(f);
    f.Formatter().joinVoices(f.getVoices()).formatToStave(f.getVoices(), stave);
    f.draw();
    ok(true);
  };
}

const basic0 = createSingleMeasureTest((f) => {
  const voice0 = f
    .Voice()
    .addTickables([
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
    ]);

  const voice1 = f
    .Voice()
    .addTickables([
      f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
      f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
      f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
      f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
      f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
      f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
    ]);

  f.Beam({ notes: voice0.getTickables() as StemmableNote[] });
  f.Beam({ notes: voice1.getTickables().slice(0, 2) as StemmableNote[] });
  f.Beam({ notes: voice1.getTickables().slice(3, 5) as StemmableNote[] });
});

const basic1 = createSingleMeasureTest((f) => {
  f.Voice().addTickables([
    f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
    f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
    f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
    f.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
  ]);

  f.Voice().addTickables([
    f.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
    f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
    f.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
    f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
  ]);
});

const basic2 = createSingleMeasureTest((f) => {
  const voice0 = f
    .Voice()
    .addTickables([
      f.StaveNote({ keys: ['a/5/x3'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5'], duration: '8' }),
      f.StaveNote({ keys: ['g/4/n', 'g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
      f.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
    ]);
  f.Beam({ notes: voice0.getTickables().slice(1, 8) as StemmableNote[] });

  const notes1 = [
    f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
    f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
    f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
    f.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
    f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '8d', stem_direction: -1 }),
    f.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
  ];
  Dot.buildAndAttach([notes1[4]], { all: true });

  const voice1 = f.Voice().addTickables(notes1);

  f.Beam({ notes: voice1.getTickables().slice(0, 2) as StemmableNote[] });
  f.Beam({ notes: voice1.getTickables().slice(4, 6) as StemmableNote[] });
});

const snare0 = createSingleMeasureTest((f) => {
  const font = {
    family: Font.SERIF,
    size: 14,
    weight: FontWeight.BOLD,
    style: FontStyle.ITALIC,
  };

  f.Voice().addTickables([
    f
      .StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
      .addModifier(f.Articulation({ type: 'a>' }), 0)
      .addModifier(f.Annotation({ text: 'L', font }), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'R', font }), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'L', font }), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'L', font }), 0),
  ]);
});

const snare1 = createSingleMeasureTest((f) => {
  f.Voice().addTickables([
    f.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 }).addModifier(f.Articulation({ type: 'ah' }), 0),
    f.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 }),
    f.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 }).addModifier(f.Articulation({ type: 'ah' }), 0),
    f.StaveNote({ keys: ['a/5/x3'], duration: '4', stem_direction: -1 }).addModifier(f.Articulation({ type: 'a,' }), 0),
  ]);
});

const snare2 = createSingleMeasureTest((f) => {
  f.Voice().addTickables([
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(1), 0),
    f.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(1), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(3), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(new Tremolo(4), 0),
  ]);
});

const snare3 = createSingleMeasureTest((factory) => {
  factory
    .Voice()
    .addTickables([
      factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(2), 0),
      factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(2), 0),
      factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(3), 0),
      factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addModifier(new Tremolo(4), 0),
    ]);
});

VexFlowTests.register(PercussionTests);
export { PercussionTests };
