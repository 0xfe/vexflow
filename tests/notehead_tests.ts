// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// NoteHead Tests

/* eslint-disable */
// @ts-nocheck

// TODO: NoteHead constructor should take a Partial<NoteHeadStruct>.
// In the basicBoundingBoxes() test case, we omit the note_type option.

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Flow } from 'flow';
import { Formatter } from 'formatter';
import { NoteHead } from 'notehead';
import { ContextBuilder } from 'renderer';
import { Stave } from 'stave';
import { StaveNote, StaveNoteStruct } from 'stavenote';
import { TickContext } from 'tickcontext';
import { Voice } from 'voice';
import { RenderContext } from 'types/common';

const NoteHeadTests = {
  Start(): void {
    QUnit.module('NoteHead');
    const run = VexFlowTests.runTests;
    run('Basic', this.basic);
    run('Various Heads', this.variousHeads);
    run('Drum Chord Heads', this.drumChordHeads);
    run('Bounding Boxes', this.basicBoundingBoxes);
  },

  basic(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = setupContext(options, 450, 250);

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
      { keys: ['x/'], duration: '1' },

      { keys: ['g/5/s1'], duration: '4' },
      { keys: ['g/5/s2'], duration: '4' },
      { keys: ['x/'], duration: '1' },

      { keys: ['g/5/r1'], duration: '4' },
      { keys: ['g/5/r2'], duration: '4' },
    ];

    const ctx = contextBuilder(options.elementId, notes.length * 25 + 100, 240);

    // Draw two staves, one with up-stems and one with down-stems.
    for (let staveNum = 0; staveNum < 2; ++staveNum) {
      const stave = new Stave(10, 10 + staveNum * 120, notes.length * 25 + 75)
        .addClef('percussion')
        .setContext(ctx)
        .draw();

      for (let i = 0; i < notes.length; ++i) {
        const note = notes[i];
        note.stem_direction = staveNum === 0 ? -1 : 1;
        const staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    }
  },

  drumChordHeads(options: TestOptions, contextBuilder: ContextBuilder): void {
    const notes: StaveNoteStruct[] = [
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
        const staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
        ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
      }
    }
  },

  basicBoundingBoxes(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = setupContext(options, 350, 250);

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

function setupContext(options: TestOptions, x: number, y: number): { context: RenderContext; stave: Stave } {
  // use ! operator because we know the options.contextBuilder is set.
  // eslint-disable-next-line
  const context = options.contextBuilder!(options.elementId, x || 450, y || 140);
  context.scale(0.9, 0.9);
  context.fillStyle = '#221';
  context.strokeStyle = '#221';
  context.font = ' 10pt Arial';
  const stave = new Stave(10, 10, x || 450).addTrebleGlyph();

  return { context, stave };
}

function showNote(note_struct: StaveNoteStruct, stave: Stave, ctx: RenderContext, x: number) {
  const note = new StaveNote(note_struct).setStave(stave);
  new TickContext().addTickable(note).preFormat().setX(x);
  note.setContext(ctx).draw();
  return note;
}

export { NoteHeadTests };
