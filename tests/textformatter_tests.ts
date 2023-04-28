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
    QUnit.test('Basic', basic);
    const run = VexFlowTests.runTextTests;
    run('Accuracy', accuracy);
    run('Box Text', textBoxAccuracy);
  },
};

function basic(assert: Assert): void {
  // See: src/fonts/textfonts.ts > loadTextFonts()
  const registeredFamilies = TextFormatter.getFontFamilies();
  assert.equal(
    registeredFamilies.length,
    5,
    `There are five registered font families: 'Roboto Slab' & 'PetalumaScript' and default 'Serif', 'Serif-Bold' and 'Sans'`
  );

  // Verify the advanceWidth and other metrics by opening the font file with a glyph inspector:
  // https://fontdrop.info/
  // https://opentype.js.org/glyph-inspector.html
  const petalumaFormatterInfo = TextFormatter.getInfo('PetalumaScript');
  assert.equal(petalumaFormatterInfo?.glyphs?.C.advanceWidth, 623, 'PetalumaScript advanceWidth of C character is 623.');

  const formatterForPetalumaScript = TextFormatter.create({ family: 'PetalumaScript', size: '100px' });
  const metricsPetalumaScriptH = formatterForPetalumaScript.getGlyphMetrics('H');
  assert.equal(metricsPetalumaScriptH.leftSideBearing, 37);

  const formatterForRobotoSlab = TextFormatter.create({ family: 'Roboto Slab', size: '100px', style: 'italic' });
  const metricsRobotoSlabH = formatterForRobotoSlab.getGlyphMetrics('H');
  assert.equal(metricsRobotoSlabH.advanceWidth, 1578);

  // eslint-disable-next-line
  // @ts-ignore direct access to protected variable .cacheKey
  assert.equal(formatterForRobotoSlab.cacheKey, 'Roboto_Slab%75%normal%normal');
}
function accuracy(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 500);
  const lineHeight = 30;
  const startX = 50;
  const fonts = [
    {
      family: Font.SERIF,
      size: 14,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    },
    {
      family: 'Roboto Slab',
      size: 14,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    },
    {
      family: Font.SANS_SERIF,
      size: 14,
      weight: FontWeight.BOLD,
      style: FontStyle.NORMAL,
    },
  ];
  let startY = 20;
  for (let j = 0; j < fonts.length; ++j) {
    const font = fonts[j];
    const textFormatter = TextFormatter.create(font);
    ctx.setFont(font);
    const texts = ['AVo(i)a', 'bghjIVex1/2', '@@@@@@@@', 'a very long String with Mixed Case Text,(0123456789)'];
    for (let i = 0; i < texts.length; i++) {
      ctx.setFillStyle('black');
      ctx.fillText(texts[i], startX, startY);
      startY += 5;
      ctx.setFillStyle('#3a2');
      ctx.fillRect(startX, startY, textFormatter.getWidthForTextInPx(texts[i]), 2);
      ctx.setFillStyle('#32a');
      startY += 5;
      ctx.fillRect(startX, startY, ctx.measureText(texts[i]).width, 2);
      startY += lineHeight;
    }
  }
  options.assert.ok(true, 'all pass');
}
function textBoxAccuracy(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 800);
  let startY = 35;
  const boxBorder = 2;
  const boxPadding = 3;
  const startX = 50;
  const fonts = [
    {
      family: Font.SERIF,
      size: 14,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    },
    {
      family: 'Roboto Slab',
      size: 14,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    },
    {
      family: Font.SANS_SERIF,
      size: 14,
      weight: FontWeight.NORMAL,
      style: FontStyle.NORMAL,
    },
  ];
  const texts = ['AVID', 'bghjIVex1/2', '@@@@@@@@'];
  for (let j = 0; j < fonts.length; ++j) {
    const font = fonts[j];
    const textFormatter = TextFormatter.create(font);
    ctx.save();
    ctx.setFont(font);
    for (let i = 0; i < texts.length; i++) {
      const textY = textFormatter.getYForStringInPx(texts[i]);
      const height = textY.height + 2 * boxPadding;
      const headroom = -1 * textY.yMin;
      const width = textFormatter.getWidthForTextInPx(texts[i]) + 2 * boxPadding;
      ctx.setFillStyle('black');
      ctx.fillText(texts[i], startX + boxPadding, startY - boxPadding);
      ctx.setLineWidth(boxBorder);
      ctx.setStrokeStyle('#3a2');
      ctx.setFillStyle('#3a2');
      ctx.beginPath();
      ctx.rect(startX, startY - height + headroom, width, height);
      ctx.stroke();
      startY += height * 1.5 + boxBorder * 3;
      const measureBox = ctx.measureText(texts[i]);
      const mwidth = measureBox.width + boxBorder * 2;
      const mheight = measureBox.height + boxBorder * 2;
      ctx.setFillStyle('black');
      ctx.fillText(texts[i], startX + boxPadding, startY - boxPadding);
      ctx.setStrokeStyle('#32a');
      ctx.setFillStyle('#32a');
      ctx.beginPath();
      ctx.rect(startX, startY - mheight, mwidth, mheight);
      ctx.stroke();
      startY += mheight * 1.5 + boxBorder * 3;
    }
    ctx.restore();
  }
  options.assert.ok(true, 'all pass');
}
VexFlowTests.register(TextFormatterTests);
export { TextFormatterTests };
