// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Rhythm Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Annotation } from '../src/annotation';
import { Beam } from '../src/beam';
import { Formatter } from '../src/formatter';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { StaveNote } from '../src/stavenote';

const RhythmTests = {
  Start(): void {
    QUnit.module('Rhythm');
    const run = VexFlowTests.runTests;
    // TODO: Simplify test names by removing 'Rhythm Draw - '.
    run('Rhythm Draw - slash notes', drawBasic);
    run('Rhythm Draw - beamed slash notes', drawBeamedSlashNotes);
    run('Rhythm Draw - beamed slash notes, some rests', drawSlashAndBeamAndRests);
    run('Rhythm Draw - 16th note rhythm with scratches', drawSixtenthWithScratches);
    run('Rhythm Draw - 32nd note rhythm with scratches', drawThirtySecondWithScratches);
  },
};

// CURRENTLY UNUSED. Draws 7 different slash notes without beams.
/*
function drawSlash(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 350, 180);
  const stave = new Stave(10, 10, 350);
  stave.setContext(ctx);
  stave.draw();

  const notes: StaveNoteStruct[] = [
    { keys: ['b/4'], duration: 'ws', stem_direction: -1 },
    { keys: ['b/4'], duration: 'hs', stem_direction: -1 },
    { keys: ['b/4'], duration: 'qs', stem_direction: -1 },
    { keys: ['b/4'], duration: '8s', stem_direction: -1 },
    { keys: ['b/4'], duration: '16s', stem_direction: -1 },
    { keys: ['b/4'], duration: '32s', stem_direction: -1 },
    { keys: ['b/4'], duration: '64s', stem_direction: -1 },
  ];
  options.assert.expect(notes.length * 2);

  for (let i = 0; i < notes.length; ++i) {
    const staveNote = new StaveNote(notes[i]).setStave(stave);
    new TickContext()
      .addTickable(staveNote)
      .preFormat()
      .setX((i + 1) * 25);
    staveNote.setContext(ctx).draw();

    options.assert.ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
    options.assert.ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
  }
}
*/

function drawBasic(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 800, 150);

  // bar 1
  const staveBar1 = new Stave(10, 30, 150);
  staveBar1.setBegBarType(BarlineType.DOUBLE);
  staveBar1.setEndBarType(BarlineType.SINGLE);
  staveBar1.addClef('treble');
  staveBar1.addTimeSignature('4/4');
  staveBar1.addKeySignature('C');
  staveBar1.setContext(ctx).draw();

  const notesBar1 = [new StaveNote({ keys: ['b/4'], duration: '1s', stem_direction: -1 })];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 120);
  staveBar2.setBegBarType(BarlineType.SINGLE);
  staveBar2.setEndBarType(BarlineType.SINGLE);
  staveBar2.setContext(ctx).draw();

  // bar 2
  const notesBar2 = [
    new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
    new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
  ];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  // bar 3 - juxtaposing second bar next to first bar
  const staveBar3 = new Stave(staveBar2.getWidth() + staveBar2.getX(), staveBar2.getY(), 170);
  staveBar3.setContext(ctx).draw();

  // bar 3
  const notesBar3 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '4s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '4s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '4s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '4s',
      stem_direction: -1,
    }),
  ];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

  // bar 4 - juxtaposing second bar next to first bar
  const staveBar4 = new Stave(staveBar3.getWidth() + staveBar3.getX(), staveBar3.getY(), 200);
  staveBar4.setContext(ctx).draw();

  // bar 4
  const notesBar4 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
  ];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
  options.assert.expect(0);
}

function drawBeamedSlashNotes(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 800, 150);

  // bar 1
  const staveBar1 = new Stave(10, 30, 300);
  staveBar1.setBegBarType(BarlineType.DOUBLE);
  staveBar1.setEndBarType(BarlineType.SINGLE);
  staveBar1.addClef('treble');
  staveBar1.addTimeSignature('4/4');
  staveBar1.addKeySignature('C');
  staveBar1.setContext(ctx).draw();

  // bar 4
  const notesBar1_part1 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
  ];

  const notesBar1_part2 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
  ];

  // create the beams for 8th notes in 2nd measure
  const beam1 = new Beam(notesBar1_part1);
  const beam2 = new Beam(notesBar1_part2);
  const notesBar1 = notesBar1_part1.concat(notesBar1_part2);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // Render beams
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  options.assert.expect(0);
}

function drawSlashAndBeamAndRests(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 800, 150);

  // bar 1
  const staveBar1 = new Stave(10, 30, 300);
  staveBar1.setBegBarType(BarlineType.DOUBLE);
  staveBar1.setEndBarType(BarlineType.SINGLE);
  staveBar1.addClef('treble');
  staveBar1.addTimeSignature('4/4');
  staveBar1.addKeySignature('F');
  staveBar1.setContext(ctx).draw();

  // bar 1
  const notesBar1_part1 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({ keys: ['b/4'], duration: '8s', stem_direction: -1 }),
  ];

  notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', VexFlowTests.Font.size + 2), 0);

  const notesBar1_part2 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '8r',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8r',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8r',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '8s',
      stem_direction: -1,
    }),
  ];

  // create the beams for 8th notes in 2nd measure
  const beam1 = new Beam(notesBar1_part1);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1.concat(notesBar1_part2));

  // Render beams
  beam1.setContext(ctx).draw();

  // bar 2 - juxtaposing second bar next to first bar
  const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 220);
  staveBar2.setContext(ctx).draw();

  const notesBar2 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '1s',
      stem_direction: -1,
    }),
  ];

  notesBar2[0].addModifier(new Annotation('F').setFont('Times', VexFlowTests.Font.size + 2), 0);
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  options.assert.expect(0);
}

function drawSixtenthWithScratches(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 800, 150);

  // bar 1
  const staveBar1 = new Stave(10, 30, 300);
  staveBar1.setBegBarType(BarlineType.DOUBLE);
  staveBar1.setEndBarType(BarlineType.SINGLE);
  staveBar1.addClef('treble');
  staveBar1.addTimeSignature('4/4');
  staveBar1.addKeySignature('F');
  staveBar1.setContext(ctx).draw();

  // bar 1
  const notesBar1_part1 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '16s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '16s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '16m',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '16s',
      stem_direction: -1,
    }),
  ];

  const notesBar1_part2 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '16m',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '16s',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '16r',
      stem_direction: -1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '16s',
      stem_direction: -1,
    }),
  ];

  notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', VexFlowTests.Font.size + 3), 0);

  // create the beams for 8th notes in 2nd measure
  const beam1 = new Beam(notesBar1_part1);
  const beam2 = new Beam(notesBar1_part2);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1.concat(notesBar1_part2));

  // Render beams
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  options.assert.expect(0);
}

function drawThirtySecondWithScratches(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 800, 150);

  // bar 1
  const staveBar1 = new Stave(10, 30, 300);
  staveBar1.setBegBarType(BarlineType.DOUBLE);
  staveBar1.setEndBarType(BarlineType.SINGLE);
  staveBar1.addClef('treble');
  staveBar1.addTimeSignature('4/4');
  staveBar1.addKeySignature('F');
  staveBar1.setContext(ctx).draw();

  // bar 1
  const notesBar1_part1 = [
    new StaveNote({
      keys: ['b/4'],
      duration: '32s',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '32s',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '32m',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '32s',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '32m',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '32s',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '32r',
      stem_direction: 1,
    }),
    new StaveNote({
      keys: ['b/4'],
      duration: '32s',
      stem_direction: 1,
    }),
  ];

  notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', VexFlowTests.Font.size + 3), 0);

  // Create the beams for 8th notes in 2nd measure.
  const beam1 = new Beam(notesBar1_part1);

  // Helper function to justify and draw a 4/4 voice.
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

  // Render beams
  beam1.setContext(ctx).draw();

  options.assert.expect(0);
}

VexFlowTests.register(RhythmTests);
export { RhythmTests };
