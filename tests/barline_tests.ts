// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Barline Tests

/* eslint-disable */
// @ts-nocheck

// TODO: Factory.BarNote()'s type argument expects BarlineType, but we pass in string. Did the previous API allow string?

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Barline, BarlineType } from 'stavebarline';

const BarlineTests = {
  Start(): void {
    QUnit.module('Barline');

    test('Enums', () => {
      equal(Barline.type, BarlineType);
    });

    const run = VexFlowTests.runTests;
    run('Simple BarNotes', (options: TestOptions) => {
      const f = VexFlowTests.makeFactory(options, 380, 160);
      const stave = f.Stave();

      const notes = [
        f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
        f.BarNote({ type: 'single' }),
        f
          .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
          .addAccidental(0, f.Accidental({ type: 'n' }))
          .addAccidental(1, f.Accidental({ type: '#' })),
      ];

      const voice = f.Voice().addTickables(notes);

      f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      f.draw();

      ok(true, 'Simple Test');
    });

    run('Style BarNotes', (options: TestOptions) => {
      const f = VexFlowTests.makeFactory(options, 380, 160);
      const stave = f.Stave();

      const notes = [
        f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
        f.BarNote({ type: 'single' }),
        f
          .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
          .addAccidental(0, f.Accidental({ type: 'n' }))
          .addAccidental(1, f.Accidental({ type: '#' })),
      ];
      notes[1].setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

      const voice = f.Voice().addTickables(notes);

      f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      f.draw();

      ok(true, 'Style');
    });
  },
};

export { BarlineTests };
