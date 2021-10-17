// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TextBracket Tests

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { FontInfo } from '../src/types/common';

const TextBracketTests = {
  Start(): void {
    QUnit.module('TextBracket');
    const run = VexFlowTests.runTests;
    run('Simple TextBracket', simple0);
    run('TextBracket Styles', simple1);
  },
};

function simple0(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 550);
  const stave = f.Stave();
  const score = f.EasyScore();

  const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
  const voice = score.voice(notes, { time: '5/4' });

  f.TextBracket({
    from: notes[0],
    to: notes[4],
    text: '15',
    options: {
      superscript: 'va',
      position: 'top',
    },
  });

  f.TextBracket({
    from: notes[0],
    to: notes[4],
    text: '8',
    options: {
      superscript: 'vb',
      position: 'bottom',
      line: 3,
    },
  });

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true);
}

function simple1(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 550);
  const stave = f.Stave();
  const score = f.EasyScore();

  const notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
  const voice = score.voice(notes, { time: '5/4' });

  const topOctaves = [
    f.TextBracket({
      from: notes[0],
      to: notes[1],
      text: 'Cool notes',
      options: {
        superscript: '',
        position: 'top',
      },
    }),
    f.TextBracket({
      from: notes[2],
      to: notes[4],
      text: 'Testing',
      options: {
        position: 'top',
        superscript: 'superscript',
        font: { family: 'Arial', size: 15, weight: '' },
      },
    }),
  ];

  const bottomOctaves = [
    f.TextBracket({
      from: notes[0],
      to: notes[1],
      text: '8',
      options: {
        superscript: 'vb',
        position: 'bottom',
        line: 3,
        font: { size: 30 } as FontInfo,
      },
    }),
    f.TextBracket({
      from: notes[2],
      to: notes[4],
      text: 'Not cool notes',
      options: {
        superscript: ' super uncool',
        position: 'bottom',
        line: 4,
      },
    }),
  ];

  topOctaves[1].render_options.line_width = 2;
  topOctaves[1].render_options.show_bracket = false;

  bottomOctaves[0].render_options.underline_superscript = false;
  bottomOctaves[0].setDashed(false);

  bottomOctaves[1].render_options.bracket_height = 40;
  bottomOctaves[1].setDashed(true, [2, 2]);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true);
}

export { TextBracketTests };
