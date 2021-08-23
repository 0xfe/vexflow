// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Mike Corrigan 2012 <corrigan@gmail.com>
//
// Percussion Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Factory } from 'factory';
import { StaveNote } from 'stavenote';
import { TickContext } from 'tickcontext';
import { Stave } from 'stave';
import { Tremolo } from 'tremolo';

const createSingleMeasureTest =
  (setup: (f: Factory) => void) =>
  (options: TestOptions): void => {
    const f = VexFlowTests.makeFactory(options, 500);
    const stave = f.Stave().addClef('percussion');

    setup(f);

    f.Formatter().joinVoices(f.getVoices()).formatToStave(f.getVoices(), stave);
    f.draw();
    ok(true);
  };

function showNote(note_struct: any, stave: any, ctx: any, x: any): StaveNote {
  const note = new StaveNote(note_struct).setStave(stave);
  new TickContext().addTickable(note).preFormat().setX(x);
  note.setContext(ctx).draw();
  return note;
}

const PercussionTests = {
  Start(): void {
    QUnit.module('Percussion');

    const run = VexFlowTests.runTests;

    run('Percussion Clef', this.draw);

    run('Percussion Notes', this.drawNotes);

    run(
      'Percussion Basic0',
      createSingleMeasureTest(function (f: Factory) {
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
      })
    );

    run(
      'Percussion Basic1',
      createSingleMeasureTest(function (f: Factory) {
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
      })
    );

    run(
      'Percussion Basic2',
      createSingleMeasureTest(function (f: Factory) {
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
      })
    );

    run(
      'Percussion Snare0',
      createSingleMeasureTest(function (f: Factory) {
        f.Voice().addTickables([
          f
            .StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, f.Articulation({ type: 'a>' }))
            .addModifier(f.Annotation({ text: 'L' }), 0),
          f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'R' }), 0),
          f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'L' }), 0),
          f.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addModifier(f.Annotation({ text: 'L' }), 0),
        ]);
      })
    );

    run(
      'Percussion Snare1',
      createSingleMeasureTest(function (f: Factory) {
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
      })
    );

    run(
      'Percussion Snare2',
      createSingleMeasureTest(function (factory) {
        factory
          .Voice()
          .addTickables([
            factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(1)),
            factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(1)),
            factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(3)),
            factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 }).addArticulation(0, new Tremolo(5)),
          ]);
      })
    );

    run(
      'Percussion Snare3',
      createSingleMeasureTest(function (factory: Factory) {
        factory
          .Voice()
          .addTickables([
            factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(2)),
            factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(2)),
            factory.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(3)),
            factory.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 }).addArticulation(0, new Tremolo(5)),
          ]);
      })
    );
  },

  draw(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 400, 120);

    new Stave(10, 10, 300).addClef('percussion').setContext(ctx).draw();

    ok(true);
  },

  drawNotes(options: TestOptions, contextBuilder: ContextBuilder): void {
    const notes = [
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
  },
};

export { PercussionTests };
