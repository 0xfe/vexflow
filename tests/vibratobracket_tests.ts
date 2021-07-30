// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Balazs Forian-Szabo
//
// VibratoBracket Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { QUnit, ok } from './declarations';

function createTest(noteGroup1, setupVibratoBracket) {
  return function (options: TestOptions) {
    const f = VexFlowTests.makeFactory(options, 650, 200);
    const stave = f.Stave();
    const score = f.EasyScore();

    const voice = score.voice(score.notes.apply(score, noteGroup1));

    setupVibratoBracket(f, voice.getTickables());

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true);
  };
}

const VibratoBracketTests = {
  Start(): void {
    const run = VexFlowTests.runTests;

    QUnit.module('VibratoBracket');

    run(
      'Simple VibratoBracket',
      createTest(['c4/4, c4, c4, c4'], function (f, notes) {
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
      createTest(['c4/4, c4, c4, c4'], function (f, notes) {
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
      createTest(['c4/4, c4, c4, c4'], function (f, notes) {
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
