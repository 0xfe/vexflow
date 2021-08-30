// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveTie Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Stem } from 'stem';
import { BuilderOptions } from 'easyscore';
import { Factory } from 'factory';
import { StaveNote } from 'stavenote';
import { Stave } from 'stave';

const createTest =
  (notesData: [string, BuilderOptions], setupTies: (f: Factory, n: StaveNote[], s: Stave) => void) =>
  (options: TestOptions) => {
    const f = VexFlowTests.makeFactory(options, 300);
    const stave = f.Stave();
    const score = f.EasyScore();
    const notes = score.notes(notesData[0], notesData[1]);
    const voice = score.voice(notes);
    // const tickables = voice.getTickables(); // same as the notes that we passed in.

    setupTies(f, notes, stave);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    ok(true);
  };

const StaveTieTests = {
  Start(): void {
    QUnit.module('StaveTie');

    const run = VexFlowTests.runTests;
    run(
      'Simple StaveTie',
      createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (f, notes) {
        f.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
        });
      })
    );

    run(
      'Chord StaveTie',
      createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' }], function (f, notes) {
        f.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1, 2],
          last_indices: [0, 1, 2],
        });
      })
    );

    run(
      'Stem Up StaveTie',
      createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' }], function (f, notes) {
        f.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1, 2],
          last_indices: [0, 1, 2],
        });
      })
    );

    run(
      'No End Note',
      createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (f, notes, stave) {
        stave.addEndClef('treble');
        f.StaveTie({
          from: notes[1],
          to: null,
          first_indices: [2],
          last_indices: [2],
          text: 'slow.',
        });
      })
    );

    run(
      'No Start Note',
      createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (f, notes, stave) {
        stave.addClef('treble');
        f.StaveTie({
          from: null,
          to: notes[0],
          first_indices: [2],
          last_indices: [2],
          text: 'H',
        });
      })
    );

    run(
      'Set Direction Down',
      createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (f, notes) {
        f.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
          options: { direction: Stem.DOWN },
        });
      })
    );

    run(
      'Set Direction Up',
      createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], function (f, notes) {
        f.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
          options: { direction: Stem.UP },
        });
      })
    );
  },
};

export { StaveTieTests };
