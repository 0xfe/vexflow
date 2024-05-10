import { Note } from './note.js';
import { Barline, BarlineType } from './stavebarline.js';
import { log } from './util.js';
function L(...args) {
    if (BarNote.DEBUG)
        log('Vex.Flow.BarNote', args);
}
class BarNote extends Note {
    static get CATEGORY() {
        return "BarNote";
    }
    constructor(type = BarlineType.SINGLE) {
        super({ duration: 'b' });
        this.metrics = {
            widths: {},
        };
        const TYPE = BarlineType;
        this.metrics.widths = {
            [TYPE.SINGLE]: 8,
            [TYPE.DOUBLE]: 12,
            [TYPE.END]: 15,
            [TYPE.REPEAT_BEGIN]: 14,
            [TYPE.REPEAT_END]: 14,
            [TYPE.REPEAT_BOTH]: 18,
            [TYPE.NONE]: 0,
        };
        this.ignore_ticks = true;
        this.setType(type);
        this.barline = new Barline(type);
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = typeof type === 'string' ? Barline.typeString[type] : type;
        this.setWidth(this.metrics.widths[this.type]);
        return this;
    }
    addToModifierContext(mc) {
        return this;
    }
    preFormat() {
        this.preFormatted = true;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        L('Rendering bar line at: ', this.getAbsoluteX());
        this.applyStyle(ctx);
        ctx.openGroup('barnote', this.getAttribute('id'));
        this.barline.setType(this.type);
        this.barline.setX(this.getAbsoluteX());
        this.barline.draw(this.checkStave());
        ctx.closeGroup();
        this.restoreStyle(ctx);
        this.setRendered();
    }
}
BarNote.DEBUG = false;
export { BarNote };
