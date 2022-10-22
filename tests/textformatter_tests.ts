// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TextFormatter Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Font, FontStyle, FontWeight } from '../src/font';
import { ContextBuilder } from '../src/renderer';
import { TextFormatter } from '../src/textformatter';

const TextFormatterTests = {
  Start(): void {
    QUnit.module('TextFormatter');
    test('Basic', basic);
    const run = VexFlowTests.runTests;
    run('Accuracy', accuracy);
  },
};

function basic(): void {
  // See: src/fonts/textfonts.ts > loadTextFonts()
  const registeredFamilies = TextFormatter.getFontFamilies();
  equal(registeredFamilies.length, 2, `There are two registered font families: 'Roboto Slab' & 'PetalumaScript'`);

  // Verify the advanceWidth and other metrics by opening the font file with a glyph inspector:
  // https://fontdrop.info/
  // https://opentype.js.org/glyph-inspector.html
  const petalumaFormatterInfo = TextFormatter.getInfo('PetalumaScript');
  equal(petalumaFormatterInfo?.glyphs?.C.advanceWidth, 623, 'PetalumaScript advanceWidth of C character is 623.');

  const formatterForPetalumaScript = TextFormatter.create({ family: 'PetalumaScript', size: '100px' });
  const metricsPetalumaScriptH = formatterForPetalumaScript.getGlyphMetrics('H');
  equal(metricsPetalumaScriptH.leftSideBearing, 37);

  const formatterForRobotoSlab = TextFormatter.create({ family: 'Roboto Slab', size: '100px', style: 'italic' });
  const metricsRobotoSlabH = formatterForRobotoSlab.getGlyphMetrics('H');
  equal(metricsRobotoSlabH.advanceWidth, 1578);

  // eslint-disable-next-line
  // @ts-ignore direct access to protected variable .cacheKey
  equal(formatterForRobotoSlab.cacheKey, 'Roboto_Slab%75%normal%normal');
}

function accuracy(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  const font = {
    family: Font.SERIF,
    size: 14,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
  };
  const textFormatter = TextFormatter.create(font);

  ctx.setFont(font);
  const texts = [
    'AVo(i)a',
    ' AVo(i)a',
    'iiiiiiiii',
    '@@@@@@@@',
    'a very long String with Mixed Case Text,(0123456789)',
  ];
  for (let i = 0; i < texts.length; i++) {
    ctx.fillText(texts[i], 50, 20 + i * 35);
    ctx.fillRect(50, 25 + i * 35, textFormatter.getWidthForTextInPx(texts[i]), 2);
    ctx.fillRect(50, 30 + i * 35, ctx.measureText(texts[i]).width, 2);
  }
  ok(true, 'all pass');
}

VexFlowTests.register(TextFormatterTests);
export { TextFormatterTests };
