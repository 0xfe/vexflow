// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Font Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Accidental } from '../src/accidental';
import { Bend } from '../src/bend';
import { CanvasContext } from '../src/canvascontext';
import { Element } from '../src/element';
import { Flow } from '../src/flow';
import { Font, FontStyle, FontWeight } from '../src/font';
import { PedalMarking } from '../src/pedalmarking';
import { StaveNote } from '../src/stavenote';
import { TextBracket } from '../src/textbracket';
import { TextNote } from '../src/textnote';
import { Voice } from '../src/voice';

const FontTests = {
  Start(): void {
    QUnit.module('Font');
    test('setFont', setFont);
    test('Parsing', fontParsing);
    test('Sizes', fontSizes);
    const run = VexFlowTests.runTests;
    run('Set Text Font to Georgia', setTextFontToGeorgia);
    run('Set Music Font to Petaluma', setMusicFontToPetaluma);
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

  // Set the font and get the font to verify that it matches.
  // NOTE: Safari has a bug where it does not return the font-weight!
  // https://github.com/0xfe/vexflow/issues/1240#issuecomment-986504088
  const ctx = new CanvasContext(canvas.getContext('2d') as CanvasRenderingContext2D);
  ctx.setFont('PetalumaScript', '100px', 'normal', 'italic');
  equal(ctx.font, 'italic 100px PetalumaScript');

  const voice = new Voice();
  // Many elements do not override the default Element.TEXT_FONT.
  propEqual(voice.fontInfo, Element.TEXT_FONT);
  voice.setFont('bold 32pt Arial');
  const fontInfo = voice.fontInfo;
  equal(fontInfo?.size, '32pt');

  const flat = new Accidental('b');
  // eslint-disable-next-line
  // @ts-ignore access a protected member for testing purposes.
  equal(flat.textFont, undefined); // The internal instance variable .textFont is undefined by default.
  // Add italic to the default font as defined in Element.TEXT_FONT (since Accidental does not override TEXT_FONT).
  flat.setFont(undefined, undefined, undefined, FontStyle.ITALIC);
  equal(flat.getFont(), 'italic 10pt Arial, sans-serif');
  // Anything that is not set will be reset to the defaults.
  flat.setFont(undefined, undefined, FontWeight.BOLD, undefined);
  equal(flat.getFont(), 'bold 10pt Arial, sans-serif');
  flat.setFont(undefined, undefined, FontWeight.BOLD, FontStyle.ITALIC);
  equal(flat.getFont(), 'italic bold 10pt Arial, sans-serif');
  flat.setFont(undefined, undefined, FontWeight.BOLD, 'oblique');
  equal(flat.getFont(), 'oblique bold 10pt Arial, sans-serif');
  // '' is equivalent to 'normal'. Neither will be included in the CSS font string.
  flat.setFont(undefined, undefined, 'normal', '');
  equal(flat.getFont(), '10pt Arial, sans-serif');
}

function fontParsing(): void {
  const b = new Bend('1/2', true);
  const bFont = b.fontInfo;
  // Check the default font.
  equal(bFont?.family, Font.SANS_SERIF);
  equal(bFont?.size, Font.SIZE);
  equal(bFont?.weight, FontWeight.NORMAL);
  equal(bFont?.style, FontStyle.NORMAL);

  const f1 = 'Roboto Slab, serif';
  const t = new TextNote({ duration: '4', font: { family: f1 } });
  equal(f1, t.fontInfo.family);

  const n1 = new StaveNote({ keys: ['e/5'], duration: '4' });
  const n2 = new StaveNote({ keys: ['c/5'], duration: '4' });
  const tb = new TextBracket({ start: n1, stop: n2 });
  const f2 = tb.fontInfo;
  equal(f2?.size, 15);
  equal(f2?.style, FontStyle.ITALIC);

  // The line-height /3 is currently ignored.
  const f3 = Font.fromCSSString(`bold 1.5em/3 "Lucida Sans Typewriter", "Lucida Console", Consolas, monospace`);
  const f3SizeInPx = Font.convertSizeToPixelValue(f3.size);
  equal(f3SizeInPx, 24);
}

function fontSizes(): void {
  {
    const size = '17px';
    const sizeInEm = Font.convertSizeToPixelValue(size) / Font.scaleToPxFrom.em;
    equal(sizeInEm, 1.0625);
  }

  {
    const size = '2em';
    const sizeInPx = Font.convertSizeToPixelValue(size);
    equal(sizeInPx, 32);
  }

  {
    const pedal = new PedalMarking([]);
    equal(pedal.getFont(), 'italic bold 12pt Times New Roman, serif');
    equal(pedal.fontSizeInPoints, 12);
    equal(pedal.fontSizeInPixels, 16);
    const doubledSizePx = pedal.fontSizeInPixels * 2; // Double the font size.
    equal(doubledSizePx, 32);
    const doubledSizePt = Font.scaleSize(pedal.fontSizeInPoints, 2); // Double the font size.
    equal(doubledSizePt, 24);

    equal(Font.scaleSize('1.5em', 3), '4.5em');
  }
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

  const voice = score.voice([
    factory.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' }),
    factory.StaveNote({ keys: ['d/4', 'f/4'], stem_direction: -1, duration: 'q' }),
    factory.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' }),
  ]);

  const formatter = factory.Formatter();
  formatter.joinVoices([voice]).formatToStave([voice], stave);

  factory.draw();

  ok(true);
}

VexFlowTests.register(FontTests);
export { FontTests };
