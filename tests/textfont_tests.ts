// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Text Font Tests

import { Bend } from 'bend';
import { TextNote } from 'textnote';

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

const TextFontTests = {
  Start(): void {
    QUnit.module('TextFont');
    test('Font Parsing', fontParsing);
    const run = VexFlowTests.runTests;
    run('Set Font', setFont);
  },
};

function fontParsing(): void {
  // Bend
  const b = new Bend('1/2', true);
  const bFont = b.getFont();
  equal(bFont?.family, 'Helvetica Neue, Arial, sans-serif');

  // TEST EACH CLASS THAT HAS A TEXT_FONT
  // XXX .... XXX
}

function setFont(options: TestOptions): void {
  const factory = VexFlowTests.makeFactory(options, 400, 200);
  const stave = factory.Stave({ y: 40 });
  const score = factory.EasyScore();

  const voice1 = score.voice([
    factory.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' }),
    factory.StaveNote({ keys: ['d/4', 'f/4'], stem_direction: -1, duration: 'q' }),
    factory.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' }),
  ]);

  // Set the default before we instantiate TextNote objects with the factory.
  TextNote.TEXT_FONT = {
    family: 'Georgia, Courier New, serif',
    size: 13,
    weight: 'bold',
    style: 'italic',
  };

  const voice2 = score.voice([
    factory
      .TextNote({ text: 'Here are some fun lyrics...', duration: 'w' })
      .setJustification(TextNote.Justification.LEFT),
  ]);

  const formatter = factory.Formatter();
  formatter.joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave);

  factory.draw();
  ok(true);
}

export { TextFontTests };
