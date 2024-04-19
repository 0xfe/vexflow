// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Barline Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Renderer } from '../src';
import { Barline, BarlineType } from '../src/stavebarline';

const BarlineTests = {
  Start(): void {
    QUnit.module('Barline');
    QUnit.test('Enums', enums);
    const run = VexFlowTests.runTests;
    run('Simple BarNotes', simple);
    run('Style BarNotes', style);
  },
};

function enums(assert: Assert): void {
  // VexFlow 4.0 renamed Barline.type => BarlineType.
  // The old way still works, for backwards compatibility.
  assert.equal(Barline.type, BarlineType);

  const a = BarlineType['DOUBLE'];
  const b = BarlineType.DOUBLE;
  assert.equal(a, b);
}

function simple(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 380, 160);
  const stave = f.Stave();

  const notes = [
    f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
    f.BarNote({ type: 'single' }),
    f
      .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
      .addModifier(f.Accidental({ type: 'n' }), 0)
      .addModifier(f.Accidental({ type: '#' }), 1),
  ];

  const voice = f.Voice().addTickables(notes);
  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
  f.draw();

  if (options.backend === Renderer.Backends.SVG) {
    notes.forEach((note) => {
      options.assert.notEqual(note.getSVGElement(), undefined);
    });
  }

  options.assert.ok(true, 'Simple Test');
}

function style(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 380, 160);
  const stave = f.Stave();

  const notes = [
    f.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '2' }),
    f.BarNote({ type: 'single' }),
    f
      .StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '2' })
      .addModifier(f.Accidental({ type: 'n' }), 0)
      .addModifier(f.Accidental({ type: '#' }), 1),
  ];
  notes[1].setStyle({ shadowBlur: 15, shadowColor: 'blue', fillStyle: 'blue', strokeStyle: 'blue' });

  const voice = f.Voice().addTickables(notes);
  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
  f.draw();

  options.assert.ok(true, 'Style');
}

VexFlowTests.register(BarlineTests);
export { BarlineTests };
