import { Glyph } from './glyph.js';
import { StaveModifier, StaveModifierPosition } from './stavemodifier.js';
import { Tables } from './tables.js';
import { defined } from './util.js';
class KeySignature extends StaveModifier {
    static get CATEGORY() {
        return "KeySignature";
    }
    constructor(keySpec, cancelKeySpec, alterKeySpec) {
        super();
        this.accList = [];
        this.setKeySig(keySpec, cancelKeySpec, alterKeySpec);
        this.setPosition(StaveModifierPosition.BEGIN);
        this.glyphFontScale = Tables.NOTATION_FONT_SCALE;
        this.glyphs = [];
        this.xPositions = [];
        this.paddingForced = false;
    }
    convertToGlyph(acc, nextAcc) {
        const accGlyphData = Tables.accidentalCodes(acc.type);
        const glyph = new Glyph(accGlyphData.code, this.glyphFontScale);
        let extraWidth = 1;
        if (acc.type === 'n' && nextAcc) {
            const spacing = KeySignature.accidentalSpacing[nextAcc.type];
            if (spacing) {
                const isAbove = nextAcc.line >= acc.line;
                extraWidth = isAbove ? spacing.above : spacing.below;
            }
        }
        this.placeGlyphOnLine(glyph, this.checkStave(), acc.line);
        this.glyphs.push(glyph);
        const xPosition = this.xPositions[this.xPositions.length - 1];
        const glyphWidth = glyph.getMetrics().width + extraWidth;
        this.xPositions.push(xPosition + glyphWidth);
        this.width += glyphWidth;
    }
    cancelKey(spec) {
        this.formatted = false;
        this.cancelKeySpec = spec;
        return this;
    }
    convertToCancelAccList(spec) {
        const cancel_accList = Tables.keySignature(spec);
        const different_types = this.accList.length > 0 && cancel_accList.length > 0 && cancel_accList[0].type !== this.accList[0].type;
        const naturals = different_types ? cancel_accList.length : cancel_accList.length - this.accList.length;
        if (naturals < 1)
            return undefined;
        const cancelled = [];
        for (let i = 0; i < naturals; i++) {
            let index = i;
            if (!different_types) {
                index = cancel_accList.length - naturals + i;
            }
            const acc = cancel_accList[index];
            cancelled.push({ type: 'n', line: acc.line });
        }
        this.accList = cancelled.concat(this.accList);
        return {
            accList: cancelled,
            type: cancel_accList[0].type,
        };
    }
    addToStave(stave) {
        this.paddingForced = true;
        stave.addModifier(this);
        return this;
    }
    convertAccLines(clef, type, accList = this.accList) {
        let offset = 0.0;
        let customLines;
        switch (clef) {
            case 'soprano':
                if (type === '#')
                    customLines = [2.5, 0.5, 2, 0, 1.5, -0.5, 1];
                else
                    offset = -1;
                break;
            case 'mezzo-soprano':
                if (type === 'b')
                    customLines = [0, 2, 0.5, 2.5, 1, 3, 1.5];
                else
                    offset = 1.5;
                break;
            case 'alto':
                offset = 0.5;
                break;
            case 'tenor':
                if (type === '#')
                    customLines = [3, 1, 2.5, 0.5, 2, 0, 1.5];
                else
                    offset = -0.5;
                break;
            case 'baritone-f':
            case 'baritone-c':
                if (type === 'b')
                    customLines = [0.5, 2.5, 1, 3, 1.5, 3.5, 2];
                else
                    offset = 2;
                break;
            case 'bass':
            case 'french':
                offset = 1;
                break;
            default:
                break;
        }
        let i;
        if (typeof customLines !== 'undefined') {
            for (i = 0; i < accList.length; ++i) {
                accList[i].line = customLines[i];
            }
        }
        else if (offset !== 0) {
            for (i = 0; i < accList.length; ++i) {
                accList[i].line += offset;
            }
        }
    }
    getPadding(index) {
        if (!this.formatted)
            this.format();
        return this.glyphs.length === 0 || (!this.paddingForced && index < 2) ? 0 : this.padding;
    }
    getWidth() {
        if (!this.formatted)
            this.format();
        return this.width;
    }
    setKeySig(keySpec, cancelKeySpec, alterKeySpec) {
        this.formatted = false;
        this.keySpec = keySpec;
        this.cancelKeySpec = cancelKeySpec;
        this.alterKeySpec = alterKeySpec;
        return this;
    }
    alterKey(alterKeySpec) {
        this.formatted = false;
        this.alterKeySpec = alterKeySpec;
        return this;
    }
    convertToAlterAccList(alterKeySpec) {
        const max = Math.min(alterKeySpec.length, this.accList.length);
        for (let i = 0; i < max; ++i) {
            if (alterKeySpec[i]) {
                this.accList[i].type = alterKeySpec[i];
            }
        }
    }
    format() {
        const stave = this.checkStave();
        this.width = 0;
        this.glyphs = [];
        this.xPositions = [0];
        this.accList = Tables.keySignature(defined(this.keySpec));
        const accList = this.accList;
        const firstAccidentalType = accList.length > 0 ? accList[0].type : undefined;
        let cancelAccList;
        if (this.cancelKeySpec) {
            cancelAccList = this.convertToCancelAccList(this.cancelKeySpec);
        }
        if (this.alterKeySpec) {
            this.convertToAlterAccList(this.alterKeySpec);
        }
        if (this.accList.length > 0) {
            const clef = (this.position === StaveModifierPosition.END ? stave.getEndClef() : stave.getClef()) || stave.getClef();
            if (cancelAccList) {
                this.convertAccLines(clef, cancelAccList.type, cancelAccList.accList);
            }
            this.convertAccLines(clef, firstAccidentalType, accList);
            for (let i = 0; i < this.accList.length; ++i) {
                this.convertToGlyph(this.accList[i], this.accList[i + 1]);
            }
        }
        this.formatted = true;
    }
    getGlyphs() {
        if (!this.formatted)
            this.format();
        return this.glyphs;
    }
    draw() {
        const stave = this.checkStave();
        const ctx = stave.checkContext();
        if (!this.formatted)
            this.format();
        this.setRendered();
        this.applyStyle(ctx);
        ctx.openGroup('keysignature', this.getAttribute('id'));
        for (let i = 0; i < this.glyphs.length; i++) {
            const glyph = this.glyphs[i];
            const x = this.x + this.xPositions[i];
            glyph.setStave(stave);
            glyph.setContext(ctx);
            glyph.renderToStave(x);
        }
        ctx.closeGroup();
        this.restoreStyle(ctx);
    }
}
KeySignature.accidentalSpacing = {
    '#': {
        above: 6,
        below: 4,
    },
    b: {
        above: 4,
        below: 7,
    },
    n: {
        above: 4,
        below: 1,
    },
    '##': {
        above: 6,
        below: 4,
    },
    bb: {
        above: 4,
        below: 7,
    },
    db: {
        above: 4,
        below: 7,
    },
    d: {
        above: 4,
        below: 7,
    },
    bbs: {
        above: 4,
        below: 7,
    },
    '++': {
        above: 6,
        below: 4,
    },
    '+': {
        above: 6,
        below: 4,
    },
    '+-': {
        above: 6,
        below: 4,
    },
    '++-': {
        above: 6,
        below: 4,
    },
    bs: {
        above: 4,
        below: 10,
    },
    bss: {
        above: 4,
        below: 10,
    },
};
export { KeySignature };
