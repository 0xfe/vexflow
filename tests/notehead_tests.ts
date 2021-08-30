// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// NoteHead Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Flow } from 'flow';
import { Stave } from 'stave';
import { StaveNote } from 'stavenote';
import { NoteHead } from 'notehead';
import { Formatter } from 'formatter';
import { Voice } from 'voice';
import { ContextBuilder } from 'renderer';
import { TickContext } from 'tickcontext';

const NoteHeadTests = {
  Start(): void {
    QUnit.module('NoteHead');
    VexFlowTests.runTests('Basic', NoteHeadTests.basic);
    VexFlowTests.runTests('Various Heads', NoteHeadTests.variousHeads);
    VexFlowTests.runTests('Drum Chord Heads', NoteHeadTests.drumChordHeads);
    VexFlowTests.runTests('Bounding Boxes', NoteHeadTests.basicBoundingBoxes);
  },

  /**
   * @param options
   * @param x
   * @param y
   * @returns
   */
  setupContext(options, x, y) {
    const ctx = options.contextBuilder(options.elementId, x || 450, y || 140);
    ctx.scale(0.9, 0.9);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = ' 10pt Arial';
    const stave = new Stave(10, 10, x || 450).addTrebleGlyph();

    return { context: ctx, stave: stave };
  },

  showNote(note_struct, stave, ctx, x) {
    const note = new StaveNote(note_struct).setStave(stave);

    new TickContext().addTickable(note).preFormat().setX(x);

    note.setContext(ctx).draw();

    return note;
  },

  basic(options: TestOptions, contextBuilder: ContextBuilder) {
    options.contextBuilder = contextBuilder;
    const c = NoteHeadTests.setupContext(options, 450, 250);

    c.stave = new Stave(10, 0, 250).addTrebleGlyph();

    c.context.scale(2.0, 2.0);
    c.stave.setContext(c.context).draw();

    const formatter = new Formatter();
    const voice = new Voice(Flow.TIME4_4).setStrict(false);

    const note_head1 = new NoteHead({
      duration: '4',
      line: 3,
    });

    const note_head2 = new NoteHead({
      duration: '1',
      line: 2.5,
    });

    const note_head3 = new NoteHead({
      duration: '2',
      line: 0,
    });

    voice.addTickables([note_head1, note_head2, note_head3]);
    formatter.joinVoices([voice]).formatToStave([voice], c.stave);

    voice.draw(c.context, c.stave);

    ok('Basic NoteHead test');
  },

  variousHeads(options: TestOptions, contextBuilder: ContextBuilder): void {
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
      { keys: ['x/'], duration: '1' },

      { keys: ['g/5/s1'], duration: '4' },
      { keys: ['g/5/s2'], duration: '4' },
      { keys: ['x/'], duration: '1' },

      { keys: ['g/5/r1'], duration: '4' },
      { keys: ['g/5/r2'], duration: '4' },
    ];

    const ctx = contextBuilder(options.elementId, notes.length * 25 + 100, 240);

    // Draw two staves, one with up-stems and one with down-stems.
    for (let h = 0; h < 2; ++h) {
      const stave = new Stave(10, 10 + h * 120, notes.length * 25 + 75).addClef('percussion').setContext(ctx).draw();

      for (let i = 0; i < notes.length; ++i) {
        const note = notes[i];
        note.stem_direction = h === 0 ? -1 : 1;
        const staveNote = NoteHeadTests.showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    }
  },

  drumChordHeads(options: TestOptions, contextBuilder: ContextBuilder): void {
    const notes = [
      { keys: ['a/4/d0', 'g/5/x3'], duration: '4' },
      { keys: ['a/4/x3', 'g/5/d0'], duration: '4' },
      { keys: ['a/4/d1', 'g/5/x2'], duration: '4' },
      { keys: ['a/4/x2', 'g/5/d1'], duration: '4' },
      { keys: ['a/4/d2', 'g/5/x1'], duration: '4' },
      { keys: ['a/4/x1', 'g/5/d2'], duration: '4' },
      { keys: ['a/4/d3', 'g/5/x0'], duration: '4' },
      { keys: ['a/4/x0', 'g/5/d3'], duration: '4' },

      { keys: ['a/4', 'g/5/d0'], duration: '4' },
      { keys: ['a/4/x3', 'g/5'], duration: '4' },

      { keys: ['a/4/t0', 'g/5/s1'], duration: '4' },
      { keys: ['a/4/s1', 'g/5/t0'], duration: '4' },
      { keys: ['a/4/t1', 'g/5/s2'], duration: '4' },
      { keys: ['a/4/s2', 'g/5/t1'], duration: '4' },
      { keys: ['a/4/t2', 'g/5/r1'], duration: '4' },
      { keys: ['a/4/r1', 'g/5/t2'], duration: '4' },
      { keys: ['a/4/t3', 'g/5/r2'], duration: '4' },
      { keys: ['a/4/r2', 'g/5/t3'], duration: '4' },
    ];

    const ctx = contextBuilder(options.elementId, notes.length * 25 + 100, 240);

    // Draw two staves, one with up-stems and one with down-stems.
    for (let h = 0; h < 2; ++h) {
      const stave = new Stave(10, 10 + h * 120, notes.length * 25 + 75).addClef('percussion').setContext(ctx).draw();

      for (let i = 0; i < notes.length; ++i) {
        const note = notes[i];
        note.stem_direction = h === 0 ? -1 : 1;
        const staveNote = NoteHeadTests.showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    }
  },

  basicBoundingBoxes(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = NoteHeadTests.setupContext(options, 350, 250);

    c.stave = new Stave(10, 0, 250).addTrebleGlyph();

    c.context.scale(2.0, 2.0);
    c.stave.setContext(c.context).draw();

    const formatter = new Formatter();
    const voice = new Voice(Flow.TIME4_4).setStrict(false);

    const note_head1 = new NoteHead({
      duration: '4',
      line: 3,
    });

    const note_head2 = new NoteHead({
      duration: '2',
      line: 2.5,
    });

    const note_head3 = new NoteHead({
      duration: '1',
      line: 0,
    });

    voice.addTickables([note_head1, note_head2, note_head3]);
    formatter.joinVoices([voice]).formatToStave([voice], c.stave);

    voice.draw(c.context, c.stave);

    note_head1.getBoundingBox().draw(c.context);
    note_head2.getBoundingBox().draw(c.context);
    note_head3.getBoundingBox().draw(c.context);

    ok('NoteHead Bounding Boxes');
  },
};

export { NoteHeadTests };
