// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Dot Tests

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Beam } from 'beam';
import { ModifierContext } from 'modifiercontext';
import { ContextBuilder } from 'renderer';
import { Stave } from 'stave';
import { StaveNote } from 'stavenote';
import { TickContext } from 'tickcontext';
import { RenderContext } from 'types/common';
import { Note } from 'note';

const DotTests = {
  Start(): void {
    QUnit.module('Dot');
    const run = VexFlowTests.runTests;
    run('Basic', basic);
    run('Multi Voice', multiVoice);
  },
};

/**
 * Helper function for the basic test case below.
 */
function showOneNote(note1: StaveNote, stave: Stave, ctx: RenderContext, x: number): void {
  const modifierContext = new ModifierContext();
  note1.setStave(stave).addToModifierContext(modifierContext);
  new TickContext().addTickable(note1).preFormat().setX(x);
  note1.setContext(ctx).draw();
  Note.plotMetrics(ctx, note1, 140);
}

function basic(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 1000, 240);
  ctx.setFillStyle('#221');
  ctx.setStrokeStyle('#221');

  const stave = new Stave(10, 10, 975);
  stave.setContext(ctx);
  stave.draw();

  const notes = [
    new StaveNote({ keys: ['c/4', 'e/4', 'a/4', 'b/4'], duration: 'w' }).addDotToAll(),
    new StaveNote({ keys: ['a/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 }).addDotToAll(),
    new StaveNote({ keys: ['g/4', 'a/4', 'b/4'], duration: '4', stem_direction: -1 }).addDotToAll(),
    new StaveNote({ keys: ['e/4', 'f/4', 'b/4', 'c/5'], duration: '4' }).addDotToAll(),
    new StaveNote({
      keys: ['g/4', 'a/4', 'd/5', 'e/5', 'g/5'],
      duration: '4',
      stem_direction: -1,
    }).addDotToAll(),
    new StaveNote({ keys: ['g/4', 'b/4', 'd/5', 'e/5'], duration: '4', stem_direction: -1 }).addDotToAll(),
    new StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 }).addDotToAll(),
    new StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
      .addDotToAll()
      .addDotToAll(),
    new StaveNote({
      keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'],
      duration: '16',
      stem_direction: -1,
    })
      .addDotToAll()
      .addDotToAll()
      .addDotToAll(),
    new StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: 1 })
      .addDotToAll()
      .addDotToAll()
      .addDotToAll(),
    new StaveNote({
      keys: ['e/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'f/5'],
      duration: '16',
      stem_direction: 1,
    }).addDotToAll(),
    new StaveNote({
      keys: ['e/4', 'g/4', 'a/4', 'b/4', 'c/5'],
      duration: '16',
      stem_direction: 1,
    }).addDotToAll(),
    new StaveNote({ keys: ['e/4', 'a/4', 'b/4', 'c/5'], duration: '16', stem_direction: 1 }).addDotToAll(),
  ];

  const beam = new Beam(notes.slice(notes.length - 2));

  for (let i = 0; i < notes.length; i++) {
    showOneNote(notes[i], stave, ctx, 30 + i * 65);
    const dots = notes[i].getDots();
    ok(dots.length > 0, 'Note ' + i + ' has dots');

    for (let j = 0; j < dots.length; ++j) {
      ok(dots[j].getWidth() > 0, 'Dot ' + j + ' has width set');
    }
  }

  beam.setContext(ctx).draw();

  VexFlowTests.plotLegendForNoteWidth(ctx, 890, 140);

  ok(true, 'Full Dot');
}

/**
 * Helper function for the multiVoice test case below.
 */
function showTwoNotes(note1: StaveNote, note2: StaveNote, stave: Stave, ctx: RenderContext, x: number): void {
  const modifierContext = new ModifierContext();
  note1.setStave(stave).addToModifierContext(modifierContext);
  note2.setStave(stave).addToModifierContext(modifierContext);

  // Note: The order in which we call preformat() and setX(x) are different from showOneNote().
  new TickContext().addTickable(note1).addTickable(note2).setX(x).preFormat();

  note1.setContext(ctx).draw();
  note2.setContext(ctx).draw();

  Note.plotMetrics(ctx, note1, 180);
  Note.plotMetrics(ctx, note2, 20);
}

function multiVoice(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 750, 300);
  ctx.setFillStyle('#221');
  ctx.setStrokeStyle('#221');

  const stave = new Stave(30, 40, 700).setContext(ctx).draw();

  let note1 = new StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 })
    .addDotToAll()
    .addDotToAll();

  let note2 = new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 }).addDotToAll();

  showTwoNotes(note1, note2, stave, ctx, 60);

  note1 = new StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
    .addDot(0)
    .addDot(0)
    .addDot(1)
    .addDot(1)
    .addDot(2)
    .addDot(2)
    .addDot(2);

  note2 = new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 }).addDotToAll().addDotToAll();

  showTwoNotes(note1, note2, stave, ctx, 150);

  note1 = new StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
    .addDotToAll()
    .addDotToAll()
    .addDot(0);

  note2 = new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 }).addDotToAll();

  showTwoNotes(note1, note2, stave, ctx, 250);

  note1 = new StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 })
    .addDotToAll()
    .addDotToAll()
    .addDot(0);

  note2 = new StaveNote({ keys: ['d/5', 'g/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 }).addDotToAll();

  showTwoNotes(note1, note2, stave, ctx, 350);

  note1 = new StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 })
    .addDotToAll()
    .addDotToAll()
    .addDot(0);

  note2 = new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 }).addDotToAll();

  showTwoNotes(note1, note2, stave, ctx, 450);

  VexFlowTests.plotLegendForNoteWidth(ctx, 620, 180);

  ok(true, 'Full Dot');
}

export { DotTests };
