import { KeySignature } from './keysignature.js';
import { Note } from './note.js';
export class KeySigNote extends Note {
    static get CATEGORY() {
        return "KeySigNote";
    }
    constructor(keySpec, cancelKeySpec, alterKeySpec) {
        super({ duration: 'b' });
        this.keySignature = new KeySignature(keySpec, cancelKeySpec, alterKeySpec);
        this.ignore_ticks = true;
    }
    addToModifierContext(mc) {
        return this;
    }
    preFormat() {
        this.preFormatted = true;
        this.keySignature.setStave(this.checkStave());
        this.setWidth(this.keySignature.getWidth());
        return this;
    }
    draw() {
        const ctx = this.checkStave().checkContext();
        this.setRendered();
        this.keySignature.setX(this.getAbsoluteX());
        this.keySignature.setContext(ctx);
        this.keySignature.draw();
    }
}
