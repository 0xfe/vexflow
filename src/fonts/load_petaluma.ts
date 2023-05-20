// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { CommonMetrics } from './common_metrics';
import { PetalumaFont } from './petaluma_glyphs';
import { ChordSymbolGlyphMetrics } from '../chordsymbol';
import { FontMetrics } from '../font';

const petalumaChordMetrics: Record<string, ChordSymbolGlyphMetrics> = {
  csymDiminished: {
    scale: 0.8,
    leftSideBearing: -95,
    advanceWidth: 506,
    yOffset: 0,
  },
  csymHalfDiminished: {
    scale: 0.8,
    leftSideBearing: -32,
    advanceWidth: 506,
    yOffset: 0,
  },
  csymAugmented: {
    scale: 1,
    leftSideBearing: -25,
    advanceWidth: 530,
    yOffset: 0,
  },
  csymParensLeftTall: {
    scale: 0.8,
    leftSideBearing: 0,
    advanceWidth: 155,
    yOffset: 150,
  },
  csymParensRightTall: {
    scale: 0.8,
    leftSideBearing: 40,
    advanceWidth: 189,
    yOffset: 150,
  },
  csymBracketLeftTall: {
    scale: 0.8,
    leftSideBearing: 0,
    advanceWidth: 328,
    yOffset: 0,
  },
  csymBracketRightTall: {
    scale: 0.8,
    leftSideBearing: 1,
    advanceWidth: 600,
    yOffset: 0,
  },
  csymParensLeftVeryTall: {
    scale: 0.95,
    leftSideBearing: 0,
    advanceWidth: 210,
    yOffset: 250,
  },
  csymParensRightVeryTall: {
    scale: 0.9,
    leftSideBearing: -100,
    advanceWidth: 111,
    yOffset: 250,
  },
  csymDiagonalArrangementSlash: {
    scale: 0.6,
    leftSideBearing: -1,
    advanceWidth: 990,
    yOffset: 0,
  },
  csymMinor: {
    scale: 0.7,
    leftSideBearing: 0,
    advanceWidth: 482,
    yOffset: 0,
  },
  csymMajorSeventh: {
    scale: 0.8,
    leftSideBearing: 100,
    yOffset: 0,
    advanceWidth: 600,
  },
  accidentalSharp: {
    scale: 0.7,
    leftSideBearing: 0,
    advanceWidth: 425,
    yOffset: -422,
  },
  accidentalFlat: {
    scale: 0.8,
    leftSideBearing: -10,
    advanceWidth: 228,
    yOffset: -284,
  }
}
export function loadPetaluma() {
  const metrics: FontMetrics = JSON.parse(JSON.stringify(CommonMetrics));
  const chordMetrics = metrics.chordSymbol;
  if (chordMetrics) {
    chordMetrics.glyphs = petalumaChordMetrics;
  }
  Font.load('Petaluma', PetalumaFont, metrics);
}
