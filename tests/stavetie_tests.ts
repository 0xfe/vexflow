// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveTie Tests

import { BuilderOptions } from 'easyscore';
import { Factory } from 'factory';
import { Stave } from 'stave';
import { StaveNote } from 'stavenote';
import { Stem } from 'stem';

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

const StaveTieTests = {
  Start(): void {
    QUnit.module('StaveTie');
    const run = VexFlowTests.runTests;
    run('Simple StaveTie', simple);
    run('Chord StaveTie', chord);
    run('Stem Up StaveTie', stemUp);
    run('No End Note', noEndNote);
    run('No Start Note', noStartNote);
    run('Set Direction Down', setDirectionDown);
    run('Set Direction Up', setDirectionUp);
  },
};

/**
 * Used by the 7 tests below to set up the stave, easyscore, notes, voice, and to format & draw.
 */
function createTest(notesData: [string, BuilderOptions], setupTies: (f: Factory, n: StaveNote[], s: Stave) => void) {
  return (options: TestOptions) => {
    const factory = VexFlowTests.makeFactory(options, 300);
    const stave = factory.Stave();
    const score = factory.EasyScore();
    const notes = score.notes(notesData[0], notesData[1]);
    const voice = score.voice(notes);
    // const tickables = voice.getTickables(); // same as the notes that we passed in.

    setupTies(factory, notes, stave);

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();
    ok(true);
  };
}

const simple = createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
  f.StaveTie({
    from: notes[0],
    to: notes[1],
    first_indices: [0, 1],
    last_indices: [0, 1],
  });
});

const chord = createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' }], (f, notes) => {
  f.StaveTie({
    from: notes[0],
    to: notes[1],
    first_indices: [0, 1, 2],
    last_indices: [0, 1, 2],
  });
});

const stemUp = createTest(['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' }], (f, notes) => {
  f.StaveTie({
    from: notes[0],
    to: notes[1],
    first_indices: [0, 1, 2],
    last_indices: [0, 1, 2],
  });
});

const noEndNote = createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes, stave) => {
  stave.addEndClef('treble');
  f.StaveTie({
    from: notes[1],
    to: null,
    first_indices: [2],
    last_indices: [2],
    text: 'slow.',
  });
});

const noStartNote = createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes, stave) => {
  stave.addClef('treble');
  f.StaveTie({
    from: null,
    to: notes[0],
    first_indices: [2],
    last_indices: [2],
    text: 'H',
  });
});

const setDirectionDown = createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
  f.StaveTie({
    from: notes[0],
    to: notes[1],
    first_indices: [0, 1],
    last_indices: [0, 1],
    options: { direction: Stem.DOWN },
  });
});

const setDirectionUp = createTest(['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }], (f, notes) => {
  f.StaveTie({
    from: notes[0],
    to: notes[1],
    first_indices: [0, 1],
    last_indices: [0, 1],
    options: { direction: Stem.UP },
  });
});

export { StaveTieTests };
