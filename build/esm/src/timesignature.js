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
    static get CATEGORY() {
        return "TimeSignature";
    }
    static get glyphs() {
        return {
            C: {
                code: 'timeSigCommon',
                line: 2,
            },
            'C|': {
                code: 'timeSigCutCommon',
                line: 2,
            },
        };
    }
    constructor(timeSpec = '4/4', customPadding = 15, validate_args = true) {
        super();
        this.timeSpec = '4/4';
        this.line = 0;
        this.is_numeric = true;
        this.validate_args = validate_args;
        const padding = customPadding;
        const musicFont = Tables.currentMusicFont();
        this.point = musicFont.lookupMetric('digits.point') || Tables.NOTATION_FONT_SCALE;
        const fontLineShift = musicFont.lookupMetric('digits.shiftLine', 0);
        this.topLine = 2 + fontLineShift;
        this.bottomLine = 4 + fontLineShift;
        this.setPosition(StaveModifierPosition.BEGIN);
        this.setTimeSig(timeSpec);
        this.setPadding(padding);
    }
    parseTimeSpec(timeSpec) {
        var _a, _b;
        if (timeSpec === 'C' || timeSpec === 'C|') {
            const { line, code } = TimeSignature.glyphs[timeSpec];
            return {
                line,
                num: false,
                glyph: new Glyph(code, Tables.NOTATION_FONT_SCALE),
            };
        }
        if (this.validate_args) {
            assertIsValidTimeSig(timeSpec);
        }
        const parts = timeSpec.split('/');
        return {
            line: 0,
            num: true,
            glyph: this.makeTimeSignatureGlyph((_a = parts[0]) !== null && _a !== void 0 ? _a : '', (_b = parts[1]) !== null && _b !== void 0 ? _b : ''),
        };
    }
    makeTimeSignatureGlyph(topDigits, botDigits) {
        return new TimeSignatureGlyph(this, topDigits, botDigits, 'timeSig0', this.point);
    }
    getInfo() {
        const { line, is_numeric, glyph } = this;
        return { line, num: is_numeric, glyph };
    }
    setTimeSig(timeSpec) {
        this.timeSpec = timeSpec;
        const info = this.parseTimeSpec(timeSpec);
        this.setGlyph(info.glyph);
        this.is_numeric = info.num;
        this.line = info.line;
        return this;
    }
    getTimeSpec() {
        return this.timeSpec;
    }
    getLine() {
        return this.line;
    }
    setLine(line) {
        this.line = line;
    }
    getGlyph() {
        return this.glyph;
    }
    setGlyph(glyph) {
        this.glyph = glyph;
        this.setWidth(defined(this.glyph.getMetrics().width));
    }
    getIsNumeric() {
        return this.is_numeric;
    }
    setIsNumeric(isNumeric) {
        this.is_numeric = isNumeric;
    }
    draw() {
        const stave = this.checkStave();
        const ctx = stave.checkContext();
        this.setRendered();
        this.applyStyle(ctx);
        ctx.openGroup('timesignature', this.getAttribute('id'));
        this.glyph.setStave(stave);
        this.glyph.setContext(ctx);
        this.placeGlyphOnLine(this.glyph, stave, this.line);
        this.glyph.renderToStave(this.x);
        ctx.closeGroup();
        this.restoreStyle(ctx);
    }
}
