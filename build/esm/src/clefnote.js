import { Clef } from './clef.js';
import { Glyph } from './glyph.js';
import { Note } from './note.js';
export class ClefNote extends Note {
    static get CATEGORY() {
        return "ClefNote";
    }
    constructor(type, size, annotation) {
        super({ duration: 'b' });
        this.type = type;
        const clef = new Clef(type, size, annotation);
        this.clef = clef.clef;
        this.annotation = clef.annotation;
        this.size = size === undefined ? 'default' : size;
        this.setWidth(Glyph.getWidth(this.clef.code, Clef.getPoint(this.size), `clefNote_${this.size}`));
        this.ignore_ticks = true;
    }
    setType(type, size, annotation) {
        this.type = type;
        this.size = size;
        const clef = new Clef(type, size, annotation);
        this.clef = clef.clef;
        this.annotation = clef.annotation;
        this.setWidth(Glyph.getWidth(this.clef.code, Clef.getPoint(this.size), `clefNote_${this.size}`));
        return this;
    }
    getClef() {
        return this.clef;
    }
    preFormat() {
        this.preFormatted = true;
        return this;
    }
    draw() {
        const stave = this.checkStave();
        const ctx = this.checkContext();
        this.setRendered();
        const abs_x = this.getAbsoluteX();
        Glyph.renderGlyph(ctx, abs_x, stave.getYForLine(this.clef.line), Clef.getPoint(this.size), this.clef.code, {
            category: `clefNote_${this.size}`,
        });
        if (this.annotation !== undefined) {
            const attachment = new Glyph(this.annotation.code, this.annotation.point);
            attachment.setContext(ctx);
            attachment.setStave(stave);
            attachment.setYShift(stave.getYForLine(this.annotation.line) - stave.getYForGlyphs());
            attachment.setXShift(this.annotation.x_shift);
            attachment.renderToStave(abs_x);
        }
    }
}
