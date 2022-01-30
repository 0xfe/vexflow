// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GhostNote Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { EasyScore } from '../src/easyscore';
import { Factory } from '../src/factory';
import { StaveNote } from '../src/stavenote';
import { StemmableNote } from '../src/stemmablenote';

const GhostNoteTests = {
  Start(): void {
    QUnit.module('GhostNote');
    const run = VexFlowTests.runTests;
    run('GhostNote Basic', basic);
    run('GhostNote Dotted', dotted);
  },
};

/**
 * Helper function to set up the stave, easyscore, voice, and to format & draw.
 */
function createTest(addItems: (f: Factory, s: EasyScore) => void) {
  return (options: TestOptions) => {
    const factory = VexFlowTests.makeFactory(options, 550);
    const stave = factory.Stave();
    const score = factory.EasyScore();

    addItems(factory, score);

    const voices = factory.getVoices();
    factory.Formatter().joinVoices(voices).formatToStave(voices, stave);
    factory.draw();

    ok(true, 'all pass');
  };
}

const basic = createTest((f: Factory, score: EasyScore) => {
  // Top Voice
  const voiceTop = score.voice(score.notes('f#5/4, f5, db5, c5, c5/8, d5, fn5, e5, d5, c5', { stem: 'up' }), {
    time: '7/4',
  });
  const notesTop = voiceTop.getTickables() as StemmableNote[];
  f.Beam({ notes: notesTop.slice(4, 8) });
  f.Beam({ notes: notesTop.slice(8, 10) });

  // Bottom Voice
  score.voice(
    [
      f.GhostNote({ duration: '2' }),
      f.StaveNote({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
      f.GhostNote({ duration: '4' }),
      f.StaveNote({ keys: ['e/4'], stem_direction: -1, duration: '4' }),
      f.GhostNote({ duration: '8' }),
      f.StaveNote({ keys: ['d/4'], stem_direction: -1, duration: '8' }).addModifier(f.Accidental({ type: '##' }), 0),
      f.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
      f.StaveNote({ keys: ['c/4'], stem_direction: -1, duration: '8' }),
    ],
    { time: '7/4' }
  );
});

/**
 * A ghost note is invisible, but takes up space on the stave corresponding to its duration.
 * '4d' is a dotted quarter note, equivalent to a quarter + eighth note.
 */
const dotted = createTest((f: Factory, score: EasyScore) => {
  const voice1 = score.voice(
    [
      f.GhostNote({ duration: '4d' }),
      f.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
      f.StaveNote({ duration: '4', keys: ['d/5'], stem_direction: 1 }),
      f.StaveNote({ duration: '8', keys: ['c/5'], stem_direction: 1 }),
      f.StaveNote({ duration: '16', keys: ['c/5'], stem_direction: 1 }),
      f.StaveNote({ duration: '16', keys: ['d/5'], stem_direction: 1 }),
      f.GhostNote({ duration: '2dd' }),
      f.StaveNote({ duration: '8', keys: ['f/5'], stem_direction: 1 }),
    ],
    { time: '8/4' }
  );

  const voice2 = score.voice(
    [
      f.StaveNote({ duration: '4', keys: ['f/4'], stem_direction: -1 }),
      f.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
      f.StaveNote({ duration: '8', keys: ['d/4'], stem_direction: -1 }),
      f.GhostNote({ duration: '4dd' }),
      f.StaveNote({ duration: '16', keys: ['c/4'], stem_direction: -1 }),
      f.StaveNote({ duration: '2', keys: ['c/4'], stem_direction: -1 }),
      f.StaveNote({ duration: '4', keys: ['d/4'], stem_direction: -1 }),
      f.StaveNote({ duration: '8', keys: ['f/4'], stem_direction: -1 }),
      f.StaveNote({ duration: '8', keys: ['e/4'], stem_direction: -1 }),
    ],
    { time: '8/4' }
  );

  const notes1 = voice1.getTickables() as StemmableNote[];
  const notes2 = voice2.getTickables() as StemmableNote[];

  const addAccidental = (note: StemmableNote, type: string) =>
    (note as StaveNote).addModifier(f.Accidental({ type }), 0);

  addAccidental(notes1[1], 'bb');
  addAccidental(notes1[4], '#');
  addAccidental(notes1[7], 'n');

  addAccidental(notes2[0], '#');
  addAccidental(notes2[4], 'b');
  addAccidental(notes2[5], '#');
  addAccidental(notes2[7], 'n');

  f.Beam({ notes: notes1.slice(3, 6) });
  f.Beam({ notes: notes2.slice(1, 3) });
  f.Beam({ notes: notes2.slice(7, 9) });
});

VexFlowTests.register(GhostNoteTests);
export { GhostNoteTests };
