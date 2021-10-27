// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Font Tests

import { Bend } from 'bend';
import { CanvasContext } from 'canvascontext';
import { Flow } from 'flow';
import { Font, FontStyle, FontWeight } from 'font';
import { StaveNote } from 'stavenote';
import { TextBracket } from 'textbracket';
import { TextNote } from 'textnote';
import { Voice } from 'voice';

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

const FontTests = {
  Start(): void {
    QUnit.module('Font');
    test('setFont Method', setFont);
    test('Font Parsing', fontParsing);
    const run = VexFlowTests.runTests;
    run('Set Text Font to Georgia', setTextFontToGeorgia);
    run('Force Petaluma Music Font', setMusicFontToPetaluma);
    run('XXX', somethingElse);
    // RONYEH.....
  },
};

/**
 * Test out the setFont method in various classes.
 */
function setFont(): void {
  // Create a CanvasCntext and call setFont on it.
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = new CanvasContext(canvas.getContext('2d') as CanvasRenderingContext2D);
  ctx.setFont('PetalumaScript', '100px', 'bold');
  equal(ctx.font, 'bold 100px PetalumaScript');

  // Not all elements render text. By default the font is `undefined`.
  const voice = new Voice();
  equal(voice.getFont(), undefined);
  // But we can set the font for fun.
  voice.setFont('bold 32pt Arial'); // RONYEH OOPS: BUGGY??
  console.log(voice.font); // RONYEH OOPS: BUGGY??
}

function fontParsing(): void {
  const b = new Bend('1/2', true);
  const bFont = b.getFont();
  // Check the default font.
  equal(bFont?.family, Font.SANS_SERIF);
  equal(bFont?.size, Font.SIZE);
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
  const f3 = Font.parseFont(`bold 1.5em/3 "Lucida Sans Typewriter", "Lucida Console", Consolas, monospace`);
  const sizeInPixels = Font.convertToPixels(f3.size);
  equal(sizeInPixels, 24);
}

function setTextFontToGeorgia(options: TestOptions): void {
  const factory = VexFlowTests.makeFactory(options, 400, 200);
  const stave = factory.Stave({ y: 40 });
  const score = factory.EasyScore();

  const voice1 = score.voice([
    factory.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' }),
    factory.StaveNote({ keys: ['d/4', 'f/4'], stem_direction: -1, duration: 'q' }),
    factory.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' }),
  ]);

  const defaultFont = TextNote.TEXT_FONT;

  // Set the default before we instantiate TextNote objects with the factory.
  TextNote.TEXT_FONT = {
    family: 'Georgia, Courier New, serif',
    size: 14,
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

  // Restore the previous default, or else it will affect the rest of the tests.
  TextNote.TEXT_FONT = defaultFont;
  ok(true);
}

function setMusicFontToPetaluma(options: TestOptions): void {
  Flow.setMusicFont('Petaluma');

  const factory = VexFlowTests.makeFactory(options, 400, 200);
  const stave = factory.Stave({ y: 40 });
  const score = factory.EasyScore();

  const voice1 = score.voice([
    factory.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' }),
    factory.StaveNote({ keys: ['d/4', 'f/4'], stem_direction: -1, duration: 'q' }),
    factory.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' }),
  ]);

  const formatter = factory.Formatter();
  formatter.joinVoices([voice1]).formatToStave([voice1], stave);

  factory.draw();

  // TODO UNSET THE FONT
  ok(true);
}

function somethingElse(options: TestOptions): void {
  const factory = VexFlowTests.makeFactory(options, 400, 200);
  const stave = factory.Stave({ y: 40 });
  const score = factory.EasyScore();

  const voice1 = score.voice([
    factory.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' }),
    factory.StaveNote({ keys: ['d/4', 'f/4'], stem_direction: -1, duration: 'q' }),
    factory.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' }),
  ]);

  const formatter = factory.Formatter();
  formatter.joinVoices([voice1]).formatToStave([voice1], stave);

  factory.draw();

  // RONYEH DO WE HAVE TO UNSET THE FONT???

  ok(true);
}

export { FontTests };
