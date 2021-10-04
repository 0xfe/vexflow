// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Text Font Tests

import { Bend } from 'bend';
import { StaveNote } from 'stavenote';
import { TextBracket } from 'textbracket';
import { FontStyle, FontWeight, TextFont } from 'textfont';
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
  const b = new Bend('1/2', true);
  const bFont = b.getFont();
  // Check the default font.
  equal(bFont?.family, TextFont.SANS_SERIF);
  equal(bFont?.size, TextFont.SIZE);
  equal(bFont?.weight, FontWeight.NORMAL);
  equal(bFont?.style, FontStyle.NORMAL);

  const f1 = 'Roboto Slab, serif';
  const t = new TextNote({ duration: '4', font: { family: f1 } });
  equal(f1, t.getFont()?.family);

  const n1 = new StaveNote({ keys: ['e/5'], duration: '4' });
  const n2 = new StaveNote({ keys: ['c/5'], duration: '4' });
  const tb = new TextBracket({ start: n1, stop: n2 });
  const f2 = tb.getFont();
  equal(f2?.size, 15);
  equal(f2?.style, FontStyle.ITALIC);

  // The line-height /3 is currently ignored.
  const f3 = TextFont.parseFont(`bold 1.5em/3 "Lucida Sans Typewriter", "Lucida Console", Consolas, monospace`);
  const sizeInPixels = TextFont.convertToPixels(f3.size);
  equal(sizeInPixels, 24);
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
