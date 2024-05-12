import { Font } from '../font.js';
import { CommonMetrics } from './common_metrics.js';
import { PetalumaFont } from './petaluma_glyphs.js';
const petalumaChordMetrics = {
    csymDiminished: {
        leftSideBearing: -95,
        advanceWidth: 506,
        yOffset: 0,
    },
    csymHalfDiminished: {
        leftSideBearing: -32,
        advanceWidth: 506,
        yOffset: 0,
    },
    csymAugmented: {
        leftSideBearing: -25,
        advanceWidth: 530,
        yOffset: 0,
    },
    csymParensLeftTall: {
        leftSideBearing: 0,
        advanceWidth: 155,
        yOffset: 150,
    },
    csymParensRightTall: {
        leftSideBearing: 40,
        advanceWidth: 189,
        yOffset: 150,
    },
    csymBracketLeftTall: {
        leftSideBearing: 0,
        advanceWidth: 328,
        yOffset: 0,
    },
    csymBracketRightTall: {
        leftSideBearing: 1,
        advanceWidth: 600,
        yOffset: 0,
    },
    csymParensLeftVeryTall: {
        leftSideBearing: 0,
        advanceWidth: 210,
        yOffset: 250,
    },
    csymParensRightVeryTall: {
        leftSideBearing: -100,
        advanceWidth: 111,
        yOffset: 250,
    },
    csymDiagonalArrangementSlash: {
        leftSideBearing: -1,
        advanceWidth: 990,
        yOffset: 0,
    },
    csymMinor: {
        leftSideBearing: 0,
        advanceWidth: 482,
        yOffset: 0,
    },
    csymMajorSeventh: {
        leftSideBearing: 100,
        yOffset: 0,
        advanceWidth: 600,
    },
    accidentalSharp: {
        leftSideBearing: 0,
        advanceWidth: 425,
        yOffset: -422,
    },
    accidentalFlat: {
        leftSideBearing: -10,
        advanceWidth: 228,
        yOffset: -284,
    },
};
export function loadPetaluma() {
    const metrics = JSON.parse(JSON.stringify(CommonMetrics));
    const chordMetrics = metrics.chordSymbol;
    if (chordMetrics) {
        chordMetrics.glyphs = petalumaChordMetrics;
    }
    Font.load('Petaluma', PetalumaFont, metrics);
}
