// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TextFormatter Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { TextFormatter } from '../src/textformatter';

const TextFormatterTests = {
  Start(): void {
    QUnit.module('TextFormatter');
    test('Basic', basic);
  },
};

function basic(): void {
  // See: src/fonts/loadTextFonts.ts
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

VexFlowTests.register(TextFormatterTests);
export { TextFormatterTests };
