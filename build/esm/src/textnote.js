import { Font, FontStyle, FontWeight } from './font.js';
import { Glyph } from './glyph.js';
import { Note } from './note.js';
import { Tables } from './tables.js';
import { RuntimeError } from './util.js';
export var TextJustification;
(function (TextJustification) {
    TextJustification[TextJustification["LEFT"] = 1] = "LEFT";
    TextJustification[TextJustification["CENTER"] = 2] = "CENTER";
    TextJustification[TextJustification["RIGHT"] = 3] = "RIGHT";
})(TextJustification || (TextJustification = {}));
class TextNote extends Note {
    static get CATEGORY() {
        return "TextNote";
    }
    static get GLYPHS() {
        return {
            segno: {
                code: 'segno',
            },
            tr: {
                code: 'ornamentTrill',
            },
            mordent: {
                code: 'ornamentMordent',
            },
            mordent_upper: {
                code: 'ornamentShortTrill',
            },
            mordent_lower: {
                code: 'ornamentMordent',
            },
            f: {
                code: 'dynamicForte',
            },
            p: {
                code: 'dynamicPiano',
            },
            m: {
                code: 'dynamicMezzo',
            },
            s: {
                code: 'dynamicSforzando',
            },
            z: {
                code: 'dynamicZ',
            },
            coda: {
                code: 'coda',
            },
            pedal_open: {
                code: 'keyboardPedalPed',
            },
            pedal_close: {
                code: 'keyboardPedalUp',
            },
            caesura_straight: {
                code: 'caesura',
            },
            caesura_curved: {
                code: 'caesuraCurved',
            },
            breath: {
                code: 'breathMarkComma',
            },
            tick: {
                code: 'breathMarkTick',
            },
            turn: {
                code: 'ornamentTurn',
            },
            turn_inverted: {
                code: 'ornamentTurnSlash',
            },
        };
    }
    constructor(noteStruct) {
        super(noteStruct);
        this.text = noteStruct.text || '';
        this.superscript = noteStruct.superscript;
        this.subscript = noteStruct.subscript;
        this.setFont(noteStruct.font);
        this.line = noteStruct.line || 0;
        this.smooth = noteStruct.smooth || false;
        this.ignore_ticks = noteStruct.ignore_ticks || false;
        this.justification = TextJustification.LEFT;
        if (noteStruct.glyph) {
            const struct = TextNote.GLYPHS[noteStruct.glyph];
            if (!struct)
                throw new RuntimeError('Invalid glyph type: ' + noteStruct.glyph);
            this.glyph = new Glyph(struct.code, Tables.NOTATION_FONT_SCALE, { category: 'textNote' });
            this.setWidth(this.glyph.getMetrics().width);
        }
        else {
            this.glyph = undefined;
        }
    }
    setJustification(just) {
        this.justification = just;
        return this;
    }
    setLine(line) {
        this.line = line;
        return this;
    }
    getLine() {
        return this.line;
    }
    getText() {
        return this.text;
    }
    preFormat() {
        if (this.preFormatted)
            return;
        const tickContext = this.checkTickContext(`Can't preformat without a TickContext.`);
        if (this.smooth) {
            this.setWidth(0);
        }
        else {
            if (this.glyph) {
            }
            else {
                const ctx = this.checkContext();
                ctx.setFont(this.textFont);
                this.setWidth(ctx.measureText(this.text).width);
            }
        }
        if (this.justification === TextJustification.CENTER) {
            this.leftDisplacedHeadPx = this.width / 2;
        }
        else if (this.justification === TextJustification.RIGHT) {
            this.leftDisplacedHeadPx = this.width;
        }
        this.rightDisplacedHeadPx = tickContext.getMetrics().glyphPx / 2;
        this.preFormatted = true;
    }
    draw() {
        const ctx = this.checkContext();
        const stave = this.checkStave();
        const tickContext = this.checkTickContext(`Can't draw without a TickContext.`);
        this.setRendered();
        let x = this.getAbsoluteX() + tickContext.getMetrics().glyphPx / 2;
        const width = this.getWidth();
        if (this.justification === TextJustification.CENTER) {
            x -= width / 2;
        }
        else if (this.justification === TextJustification.RIGHT) {
            x -= width;
        }
        let y;
        if (this.glyph) {
            y = stave.getYForLine(this.line + -3);
            this.glyph.render(ctx, x, y);
        }
        else {
            y = stave.getYForLine(this.line + -3);
            this.applyStyle(ctx);
            ctx.setFont(this.textFont);
            ctx.fillText(this.text, x, y);
            const height = ctx.measureText(this.text).height;
            const { family, size, weight, style } = this.textFont;
            const smallerFontSize = Font.scaleSize(size, 0.769231);
            if (this.superscript) {
                ctx.setFont(family, smallerFontSize, weight, style);
                ctx.fillText(this.superscript, x + this.width + 2, y - height / 2.2);
            }
            if (this.subscript) {
                ctx.setFont(family, smallerFontSize, weight, style);
                ctx.fillText(this.subscript, x + this.width + 2, y + height / 2.2 - 1);
            }
            this.restoreStyle(ctx);
        }
    }
}
TextNote.TEXT_FONT = {
    family: Font.SANS_SERIF,
    size: 12,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
};
TextNote.Justification = TextJustification;
export { TextNote };
