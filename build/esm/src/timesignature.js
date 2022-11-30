import { Glyph } from './glyph.js';
import { StaveModifier, StaveModifierPosition } from './stavemodifier.js';
import { Tables } from './tables.js';
import { TimeSignatureGlyph } from './timesigglyph.js';
import { defined, RuntimeError } from './util.js';
const assertIsValidTimeSig = (timeSpec) => {
    const numbers = timeSpec.split('/');
    if (numbers.length !== 2 && numbers[0] !== '+' && numbers[0] !== '-') {
        throw new RuntimeError('BadTimeSignature', `Invalid time spec: ${timeSpec}. Must be in the form "<numerator>/<denominator>"`);
    }
    numbers.forEach((number) => {
        if (/^[0-9+\-()]+$/.test(number) == false) {
            throw new RuntimeError('BadTimeSignature', `Invalid time spec: ${timeSpec}. Must contain valid signatures.`);
        }
    });
};
export class TimeSignature extends StaveModifier {
    constructor(timeSpec = '4/4', customPadding = 15, validate_args = true) {
        super();
        this.validate_args = validate_args;
        const padding = customPadding;
        const musicFont = Tables.currentMusicFont();
        this.point = musicFont.lookupMetric('digits.point');
        const fontLineShift = musicFont.lookupMetric('digits.shiftLine', 0);
        this.topLine = 2 + fontLineShift;
        this.bottomLine = 4 + fontLineShift;
        this.setPosition(StaveModifierPosition.BEGIN);
        this.info = this.parseTimeSpec(timeSpec);
        this.setWidth(defined(this.info.glyph.getMetrics().width));
        this.setPadding(padding);
    }
    static get CATEGORY() {
        return "TimeSignature";
    }
    static get glyphs() {
        return {
            C: {
                code: 'timeSigCommon',
                point: 40,
                line: 2,
            },
            'C|': {
                code: 'timeSigCutCommon',
                point: 40,
                line: 2,
            },
        };
    }
    parseTimeSpec(timeSpec) {
        var _a, _b;
        if (timeSpec === 'C' || timeSpec === 'C|') {
            const { line, code, point } = TimeSignature.glyphs[timeSpec];
            return {
                line,
                num: false,
                glyph: new Glyph(code, point),
            };
        }
        if (this.validate_args) {
            assertIsValidTimeSig(timeSpec);
        }
        const parts = timeSpec.split('/');
        return {
            num: true,
            glyph: this.makeTimeSignatureGlyph((_a = parts[0]) !== null && _a !== void 0 ? _a : '', (_b = parts[1]) !== null && _b !== void 0 ? _b : ''),
        };
    }
    makeTimeSignatureGlyph(topDigits, botDigits) {
        return new TimeSignatureGlyph(this, topDigits, botDigits, 'timeSig0', this.point);
    }
    getInfo() {
        return this.info;
    }
    setTimeSig(timeSpec) {
        this.info = this.parseTimeSpec(timeSpec);
        return this;
    }
    draw() {
        const stave = this.checkStave();
        const ctx = stave.checkContext();
        this.setRendered();
        this.applyStyle(ctx);
        ctx.openGroup('timesignature', this.getAttribute('id'));
        this.info.glyph.setStave(stave);
        this.info.glyph.setContext(ctx);
        this.placeGlyphOnLine(this.info.glyph, stave, this.info.line);
        this.info.glyph.renderToStave(this.x);
        ctx.closeGroup();
        this.restoreStyle(ctx);
    }
}
