// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Rhythm Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { StaveNoteTests } from './stavenote_tests';
import { ContextBuilder } from 'renderer';
import { Formatter } from 'formatter';
import { Beam } from 'beam';
import { Annotation } from 'annotation';
import { StaveNote } from 'stavenote';
import { Stave } from 'stave';

const RhythmTests = {
  Start(): void {
    QUnit.module('Rhythm');
    const run = VexFlowTests.runTests;
    run('Rhythm Draw - slash notes', this.drawBasic);
    run('Rhythm Draw - beamed slash notes', this.drawBeamedSlashNotes);
    run('Rhythm Draw - beamed slash notes, some rests', this.drawSlashAndBeamAndRests);
    run('Rhythm Draw - 16th note rhythm with scratches', this.drawSixtenthWithScratches);
    run('Rhythm Draw - 32nd note rhythm with scratches', this.drawThirtySecondWithScratches);
  },

  drawSlash(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 350, 180);
    const stave = new Stave(10, 10, 350);
    stave.setContext(ctx);
    stave.draw();

    const notes = [
      { keys: ['b/4'], duration: 'ws', stem_direction: -1 },
      { keys: ['b/4'], duration: 'hs', stem_direction: -1 },
      { keys: ['b/4'], duration: 'qs', stem_direction: -1 },
      { keys: ['b/4'], duration: '8s', stem_direction: -1 },
      { keys: ['b/4'], duration: '16s', stem_direction: -1 },
      { keys: ['b/4'], duration: '32s', stem_direction: -1 },
      { keys: ['b/4'], duration: '64s', stem_direction: -1 },
    ];
    expect(notes.length * 2);

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const staveNote = StaveNoteTests.showNote(note, stave, ctx, (i + 1) * 25);

      ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
      ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
    }
  },

  drawBasic(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 150);
    staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
    staveBar1.setEndBarType(VF.Barline.type.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('C');
    staveBar1.setContext(ctx).draw();

    const notesBar1 = [new StaveNote({ keys: ['b/4'], duration: '1s', stem_direction: -1 })];

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

    // bar 2 - juxtaposing second bar next to first bar
    const staveBar2 = new Stave(staveBar1.width + staveBar1.x, staveBar1.y, 120);
    staveBar2.setBegBarType(VF.Barline.type.SINGLE);
    staveBar2.setEndBarType(VF.Barline.type.SINGLE);
    staveBar2.setContext(ctx).draw();

    // bar 2
    const notesBar2 = [
      new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
      new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
    ];

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

    // bar 3 - juxtaposing second bar next to first bar
    const staveBar3 = new Stave(staveBar2.width + staveBar2.x, staveBar2.y, 170);
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
    const staveBar4 = new Stave(staveBar3.width + staveBar3.x, staveBar3.y, 200);
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
    expect(0);
  },

  drawBeamedSlashNotes(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
    staveBar1.setEndBarType(VF.Barline.type.SINGLE);
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

    expect(0);
  },

  drawSlashAndBeamAndRests(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
    staveBar1.setEndBarType(VF.Barline.type.SINGLE);
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
    const staveBar2 = new Stave(staveBar1.width + staveBar1.x, staveBar1.y, 220);
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

    expect(0);
  },

  drawSixtenthWithScratches(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
    staveBar1.setEndBarType(VF.Barline.type.SINGLE);
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

    expect(0);
  },

  drawThirtySecondWithScratches(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 800, 150);

    // bar 1
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
    staveBar1.setEndBarType(VF.Barline.type.SINGLE);
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

    // create the beams for 8th notes in 2nd measure
    const beam1 = new Beam(notesBar1_part1);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

    // Render beams
    beam1.setContext(ctx).draw();

    expect(0);
  },
};
export { RhythmTests };
