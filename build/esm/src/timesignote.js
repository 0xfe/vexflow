import { Note } from './note.js';
import { TimeSignature } from './timesignature.js';
export class TimeSigNote extends Note {
    constructor(timeSpec, customPadding) {
        super({ duration: 'b' });
        const timeSignature = new TimeSignature(timeSpec, customPadding);
        this.timeSigInfo = timeSignature.getInfo();
        this.setWidth(this.timeSigInfo.glyph.getMetrics().width);
        this.ignore_ticks = true;
    }
    static get CATEGORY() {
        return "TimeSigNote";
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
        if (!this.timeSigInfo.glyph.getContext()) {
            this.timeSigInfo.glyph.setContext(ctx);
        }
        this.timeSigInfo.glyph.setStave(stave);
        this.timeSigInfo.glyph.setYShift(stave.getYForLine(2) - stave.getYForGlyphs());
        this.timeSigInfo.glyph.renderToStave(this.getAbsoluteX());
    }
}
