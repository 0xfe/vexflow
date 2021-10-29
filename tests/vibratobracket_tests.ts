// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Balazs Forian-Szabo
//
// VibratoBracket Tests

// TODO: It's annoying to have to cast "as Note" or "as Note[]". Could we add a method to Voice to get the tickables as Note[]? Voice.getTickables() vs Voice.getNotes()?

import { Factory } from 'factory';
import { Note } from 'note';
import { Tickable } from 'tickable';

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

const VibratoBracketTests = {
  Start(): void {
    QUnit.module('VibratoBracket');
    const run = VexFlowTests.runTests;
    run('Simple VibratoBracket', simple);
    run('Harsh VibratoBracket Without End Note', withoutEndNote);
    run('Harsh VibratoBracket Without Start Note', withoutStartNote);
  },
};

// Helper function to set up the stave, easyscore, voice, and to format & draw.
function createTest(noteGroup: string, setupVibratoBracket: (f: Factory, notes: Tickable[]) => void) {
  return (options: TestOptions) => {
    const factory = VexFlowTests.makeFactory(options, 650, 200);
    const stave = factory.Stave();
    const score = factory.EasyScore();
    const voice = score.voice(score.notes(noteGroup));

    setupVibratoBracket(factory, voice.getTickables());

    factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    factory.draw();

    ok(true);
  };
}

const simple = createTest('c4/4, c4, c4, c4', (factory, notes) => {
  factory.VibratoBracket({
    from: notes[0] as Note,
    to: notes[3] as Note,
    options: { line: 2 },
  });
});

const withoutEndNote = createTest('c4/4, c4, c4, c4', (factory, notes) => {
  factory.VibratoBracket({
    from: notes[2] as Note,
    to: null,
    options: { line: 2, harsh: true },
  });
});

const withoutStartNote = createTest('c4/4, c4, c4, c4', (factory, notes) => {
  factory.VibratoBracket({
    from: null,
    to: notes[2] as Note,
    options: { line: 2, harsh: true },
  });
});

export { VibratoBracketTests };
