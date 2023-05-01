// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Dot Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Beam } from '../src/beam';
import { Dot } from '../src/dot';
import { Formatter } from '../src/formatter';
import { ModifierContext } from '../src/modifiercontext';
import { Note } from '../src/note';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { StaveNote } from '../src/stavenote';
import { TickContext } from '../src/tickcontext';
import { Voice } from '../src/voice';

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

  const stave = new Stave(10, 10, 975);
  stave.setContext(ctx);
  stave.draw();

  const notes = [
    new StaveNote({ keys: ['c/4', 'e/4', 'a/4', 'b/4'], duration: 'w' }),
    new StaveNote({ keys: ['a/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['g/4', 'a/4', 'b/4'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['e/4', 'f/4', 'b/4', 'c/5'], duration: '4' }),
    new StaveNote({
      keys: ['g/4', 'a/4', 'd/5', 'e/5', 'g/5'],
      duration: '4',
      stem_direction: -1,
    }),
    new StaveNote({ keys: ['g/4', 'b/4', 'd/5', 'e/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' }),

    new StaveNote({
      keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'],
      duration: '16',
      stem_direction: -1,
    }),

    new StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: 1 }),

    new StaveNote({
      keys: ['e/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'f/5'],
      duration: '16',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['e/4', 'g/4', 'a/4', 'b/4', 'c/5'],
      duration: '16',
      stem_direction: 1,
    }),
    new StaveNote({ keys: ['e/4', 'a/4', 'b/4', 'c/5'], duration: '16', stem_direction: 1 }),
  ];
  Dot.buildAndAttach(notes, { all: true });
  Dot.buildAndAttach([notes[7], notes[8], notes[9]], { all: true });
  Dot.buildAndAttach([notes[8], notes[9]], { all: true });

  const beam = new Beam(notes.slice(notes.length - 2));

  for (let i = 0; i < notes.length; i++) {
    showOneNote(notes[i], stave, ctx, 30 + i * 65);
    const dots = notes[i].getModifiersByType('Dot');
    options.assert.ok(dots.length > 0, 'Note ' + i + ' has dots');

    for (let j = 0; j < dots.length; ++j) {
      options.assert.ok(dots[j].getWidth() > 0, 'Dot ' + j + ' has width set');
    }
  }

  beam.setContext(ctx).draw();

  VexFlowTests.plotLegendForNoteWidth(ctx, 890, 140);

  options.assert.ok(true, 'Full Dot');
}

function multiVoice(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 750, 300);

  const stave = new Stave(30, 45, 700).setContext(ctx).draw();

  const notes1 = [
    new StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 }),
    new StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 }),
    new StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 }),
    new StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 }),
    new StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 }),
  ];
  Dot.buildAndAttach([notes1[0], notes1[2], notes1[3], notes1[4]], { all: true });
  Dot.buildAndAttach([notes1[0], notes1[2], notes1[3], notes1[4]], { all: true });
  Dot.buildAndAttach([notes1[1]], { index: 0 });
  Dot.buildAndAttach([notes1[1]], { index: 0 });
  Dot.buildAndAttach([notes1[1]], { index: 1 });
  Dot.buildAndAttach([notes1[1]], { index: 1 });
  Dot.buildAndAttach([notes1[1]], { index: 2 });
  Dot.buildAndAttach([notes1[1]], { index: 2 });
  Dot.buildAndAttach([notes1[1]], { index: 2 });
  Dot.buildAndAttach([notes1[2], notes1[3], notes1[4]]);

  const notes2 = [
    new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 }),
    new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['d/5', 'g/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 }),
    new StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 }),
  ];
  Dot.buildAndAttach(notes2, { all: true });
  Dot.buildAndAttach([notes2[1]], { all: true });

  const voice1 = new Voice().setMode(Voice.Mode.SOFT).addTickables(notes1);
  const voice2 = new Voice().setMode(Voice.Mode.SOFT).addTickables(notes2);
  const formatter = new Formatter().joinVoices([voice1, voice2]);
  formatter.format([voice1, voice2], 700);
  voice1.draw(ctx, stave);
  voice2.draw(ctx, stave);

  notes1.forEach((note) => Note.plotMetrics(ctx, note, 190));
  notes2.forEach((note) => Note.plotMetrics(ctx, note, 20));

  VexFlowTests.plotLegendForNoteWidth(ctx, 620, 220);

  options.assert.ok(true, 'Full Dot');
}

VexFlowTests.register(DotTests);
export { DotTests };
