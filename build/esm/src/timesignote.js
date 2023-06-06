import { Note } from './note.js';
import { TimeSignature } from './timesignature.js';
export class TimeSigNote extends Note {
    static get CATEGORY() {
        return "TimeSigNote";
    }
    constructor(timeSpec, customPadding) {
        super({ duration: 'b' });
        this.timeSig = new TimeSignature(timeSpec, customPadding);
        this.setWidth(this.timeSig.getGlyph().getMetrics().width);
        this.ignore_ticks = true;
    }
    addToModifierContext(mc) {
        return this;
    }
    preFormat() {
        this.preFormatted = true;
        return this;
    }
    draw() {
        const stave = this.checkStave();
        const ctx = this.checkContext();
        this.setRendered();
        const tsGlyph = this.timeSig.getGlyph();
        if (!tsGlyph.getContext()) {
            tsGlyph.setContext(ctx);
        }
        tsGlyph.setStave(stave);
        tsGlyph.setYShift(stave.getYForLine(2) - stave.getYForGlyphs());
        tsGlyph.renderToStave(this.getAbsoluteX());
    }
}
