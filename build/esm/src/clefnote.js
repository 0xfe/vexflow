import { Clef } from './clef.js';
import { Glyph } from './glyph.js';
import { Note } from './note.js';
export class ClefNote extends Note {
    constructor(type, size, annotation) {
        super({ duration: 'b' });
        this.type = type;
        this.clef_obj = new Clef(type, size, annotation);
        this.clef = this.clef_obj.clef;
        this.glyph = new Glyph(this.clef.code, this.clef.point);
        this.setWidth(this.glyph.getMetrics().width);
        this.ignore_ticks = true;
    }
    static get CATEGORY() {
        return "ClefNote";
    }
    setType(type, size, annotation) {
        this.type = type;
        this.clef_obj = new Clef(type, size, annotation);
        this.clef = this.clef_obj.clef;
        this.glyph = new Glyph(this.clef.code, this.clef.point);
        this.setWidth(this.glyph.getMetrics().width);
        return this;
    }
    getClef() {
        return this.clef;
    }
    setContext(context) {
        super.setContext(context);
        this.glyph.setContext(this.getContext());
        return this;
    }
    getBoundingBox() {
        return super.getBoundingBox();
    }
    addToModifierContext(mc) {
        return this;
    }
    preFormat() {
        this.preFormatted = true;
        return this;
    }
    draw() {
        var _a;
        const stave = this.checkStave();
        if (!this.glyph.getContext()) {
            this.glyph.setContext(this.getContext());
        }
        this.setRendered();
        const abs_x = this.getAbsoluteX();
        this.glyph.setStave(stave);
        this.glyph.setYShift(stave.getYForLine((_a = this.clef.line) !== null && _a !== void 0 ? _a : 0) - stave.getYForGlyphs());
        this.glyph.renderToStave(abs_x);
        if (this.clef_obj.annotation !== undefined) {
            const attachment = new Glyph(this.clef_obj.annotation.code, this.clef_obj.annotation.point);
            if (!attachment.getContext()) {
                attachment.setContext(this.getContext());
            }
            attachment.setStave(stave);
            attachment.setYShift(stave.getYForLine(this.clef_obj.annotation.line) - stave.getYForGlyphs());
            attachment.setXShift(this.clef_obj.annotation.x_shift);
            attachment.renderToStave(abs_x);
        }
    }
}
