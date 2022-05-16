import { Note } from './note.js';
export class GlyphNote extends Note {
    constructor(glyph, noteStruct, options) {
        super(noteStruct);
        this.options = Object.assign({ ignoreTicks: false, line: 2 }, options);
        this.ignore_ticks = this.options.ignoreTicks;
        if (glyph) {
            this.setGlyph(glyph);
        }
    }
    static get CATEGORY() {
        return "GlyphNote";
    }
    setGlyph(glyph) {
        this.glyph = glyph;
        this.setWidth(this.glyph.getMetrics().width);
        return this;
    }
    getBoundingBox() {
        return this.glyph.getBoundingBox();
    }
    preFormat() {
        if (!this.preFormatted && this.modifierContext) {
            this.modifierContext.preFormat();
        }
        this.preFormatted = true;
        return this;
    }
    drawModifiers() {
        const ctx = this.checkContext();
        ctx.openGroup('modifiers');
        for (let i = 0; i < this.modifiers.length; i++) {
            const modifier = this.modifiers[i];
            modifier.setContext(ctx);
            modifier.drawWithStyle();
        }
        ctx.closeGroup();
    }
    draw() {
        const stave = this.checkStave();
        const ctx = stave.checkContext();
        this.setRendered();
        ctx.openGroup('glyphNote', this.getAttribute('id'));
        const glyph = this.glyph;
        if (!glyph.getContext()) {
            glyph.setContext(ctx);
        }
        glyph.setStave(stave);
        glyph.setYShift(stave.getYForLine(this.options.line) - stave.getYForGlyphs());
        const x = this.isCenterAligned() ? this.getAbsoluteX() - this.getWidth() / 2 : this.getAbsoluteX();
        glyph.renderToStave(x);
        this.drawModifiers();
        ctx.closeGroup();
    }
}
