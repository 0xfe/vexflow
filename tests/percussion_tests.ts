// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Mike Corrigan 2012 <corrigan@gmail.com>
//
// Percussion Tests

/* eslint-disable */
// @ts-nocheck

// TODO: Type 'Tickable[]' is not assignable to type 'StemmableNote[]'.
// TODO: Factory.GraceNote() should take a Partial<GraceNoteStruct>. We are omitting the 'slash' property.

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Factory } from 'factory';
import { Stave } from 'stave';
import { StaveNote, StaveNoteStruct } from 'stavenote';
import { TickContext } from 'tickcontext';
import { Tremolo } from 'tremolo';
import { RenderContext } from 'types/common';

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
    const stave = f.Stave().addClef('percussion');
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

  f.Beam({ notes: voice0.getTickables() });
  f.Beam({ notes: voice1.getTickables().slice(0, 2) });
  f.Beam({ notes: voice1.getTickables().slice(3, 6) });
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
  f.Beam({ notes: voice0.getTickables().slice(1, 8) });

  const voice1 = f
    .Voice()
    .addTickables([
      f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
      f.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
      f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
      f.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
      f.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '8d', stem_direction: -1 }).addDotToAll(),
      f.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
    ]);

  f.Beam({ notes: voice1.getTickables().slice(0, 2) });
  f.Beam({ notes: voice1.getTickables().slice(4, 6) });
});

const snare0 = createSingleMeasureTest((f) => {
  f.Voice().addTickables([
    f
      .StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
      .addArticulation(0, f.Articulation({ type: 'a>' }))
      .addModifier(f.Annotation({ text: 'L' }), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'R' }), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'L' }), 0),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'L' }), 0),
  ]);
});

const snare1 = createSingleMeasureTest((f) => {
  f.Voice().addTickables([
    f
      .StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
      .addArticulation(0, f.Articulation({ type: 'ah' })),
    f.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 }),
    f
      .StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
      .addArticulation(0, f.Articulation({ type: 'ah' })),
    f
      .StaveNote({ keys: ['a/5/x3'], duration: '4', stem_direction: -1 })
      .addArticulation(0, f.Articulation({ type: 'a,' })),
  ]);
});

const snare2 = createSingleMeasureTest((f) => {
  f.Voice().addTickables([
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(1)),
    f.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(1)),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(3)),
    f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(5)),
  ]);
});

const snare3 = createSingleMeasureTest((factory) => {
  factory
    .Voice()
    .addTickables([
      factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(2)),
      factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(2)),
      factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(3)),
      factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(5)),
    ]);
});

export { PercussionTests };
