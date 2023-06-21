import { Glyph } from './glyph.js';
import { Note } from './note.js';
import { Tables } from './tables.js';
import { defined, log, RuntimeError } from './util.js';
function L(...args) {
    if (TextDynamics.DEBUG)
        log('Vex.Flow.TextDynamics', args);
}
class TextDynamics extends Note {
    static get CATEGORY() {
        return "TextDynamics";
    }
    static get GLYPHS() {
        return {
            f: {
                code: 'dynamicForte',
                width: 12,
            },
            p: {
                code: 'dynamicPiano',
                width: 14,
            },
            m: {
                code: 'dynamicMezzo',
                width: 17,
            },
            s: {
                code: 'dynamicSforzando',
                width: 10,
            },
            z: {
                code: 'dynamicZ',
                width: 12,
            },
            r: {
                code: 'dynamicRinforzando',
                width: 12,
            },
        };
    }
    constructor(noteStruct) {
        super(noteStruct);
        this.sequence = (noteStruct.text || '').toLowerCase();
        this.line = noteStruct.line || 0;
        this.glyphs = [];
        this.render_options = Object.assign(Object.assign({}, this.render_options), { glyph_font_size: Tables.NOTATION_FONT_SCALE });
        L('New Dynamics Text: ', this.sequence);
    }
    setLine(line) {
        this.line = line;
        return this;
    }
    preFormat() {
        let total_width = 0;
        this.glyphs = [];
        this.sequence.split('').forEach((letter) => {
            const glyph_data = TextDynamics.GLYPHS[letter];
            if (!glyph_data)
                throw new RuntimeError('Invalid dynamics character: ' + letter);
            const size = defined(this.render_options.glyph_font_size);
            const glyph = new Glyph(glyph_data.code, size, { category: 'textNote' });
            this.glyphs.push(glyph);
            total_width += glyph_data.width;
        });
        this.setWidth(total_width);
        this.preFormatted = true;
        return this;
    }
    draw() {
        this.setRendered();
        const x = this.getAbsoluteX();
        const y = this.checkStave().getYForLine(this.line + -3);
        L('Rendering Dynamics: ', this.sequence);
        let letter_x = x;
        this.glyphs.forEach((glyph, index) => {
            const current_letter = this.sequence[index];
            glyph.render(this.checkContext(), letter_x, y);
            letter_x += TextDynamics.GLYPHS[current_letter].width;
        });
    }
}
TextDynamics.DEBUG = false;
export { TextDynamics };
