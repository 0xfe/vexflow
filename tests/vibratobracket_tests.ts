// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Balazs Forian-Szabo
//
// VibratoBracket Tests

/* eslint-disable */
// @ts-nocheck

// TODO: "to: null" and "from: null" do not match the declared types in the factory.VibratoBracket(params) method.
// Should we omit the to / from fields? Set them to undefined? Update the declared types to accept null?

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Factory } from 'factory';
import { StaveNote } from 'stavenote';

function createTest(noteGroup: string, setupVibratoBracket: (f: Factory, notes: StaveNote[]) => void) {
  return function (options: TestOptions) {
    const f = VexFlowTests.makeFactory(options, 650, 200);
    const stave = f.Stave();
    const score = f.EasyScore();

    const voice = score.voice(score.notes(noteGroup));

    setupVibratoBracket(f, voice.getTickables() as StaveNote[]);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true);
  };
}

const VibratoBracketTests = {
  Start(): void {
    QUnit.module('VibratoBracket');
    const run = VexFlowTests.runTests;
    run(
      'Simple VibratoBracket',
      createTest('c4/4, c4, c4, c4', (f, notes) => {
        f.VibratoBracket({
          from: notes[0],
          to: notes[3],
          options: {
            line: 2,
          },
        });
      })
    );

    run(
      'Harsh VibratoBracket Without End Note',
      createTest('c4/4, c4, c4, c4', (f, notes) => {
        f.VibratoBracket({
          from: notes[2],
          to: null,
          options: {
            line: 2,
            harsh: true,
          },
        });
      })
    );

    run(
      'Harsh VibratoBracket Without Start Note',
      createTest('c4/4, c4, c4, c4', function (f, notes) {
        f.VibratoBracket({
          from: null,
          to: notes[2],
          options: {
            line: 2,
            harsh: true,
          },
        });
      })
    );
  },
};

export { VibratoBracketTests };
