import { Element } from './element.js';
import { defined, RuntimeError } from './util.js';
export var ModifierPosition;
(function (ModifierPosition) {
    ModifierPosition[ModifierPosition["CENTER"] = 0] = "CENTER";
    ModifierPosition[ModifierPosition["LEFT"] = 1] = "LEFT";
    ModifierPosition[ModifierPosition["RIGHT"] = 2] = "RIGHT";
    ModifierPosition[ModifierPosition["ABOVE"] = 3] = "ABOVE";
    ModifierPosition[ModifierPosition["BELOW"] = 4] = "BELOW";
})(ModifierPosition || (ModifierPosition = {}));
export class Modifier extends Element {
    static get CATEGORY() {
        return "Modifier";
    }
    static get Position() {
        return ModifierPosition;
    }
    static get PositionString() {
        return {
            center: ModifierPosition.CENTER,
            above: ModifierPosition.ABOVE,
            below: ModifierPosition.BELOW,
            left: ModifierPosition.LEFT,
            right: ModifierPosition.RIGHT,
        };
    }
    constructor() {
        super();
        this.width = 0;
        this.text_line = 0;
        this.position = Modifier.Position.LEFT;
        this.x_shift = 0;
        this.y_shift = 0;
        this.spacingFromNextModifier = 0;
    }
    reset() {
    }
    getWidth() {
        return this.width;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    getNote() {
        return defined(this.note, 'NoNote', 'Modifier has no note.');
    }
    checkAttachedNote() {
        const category = this.getCategory();
        defined(this.index, 'NoIndex', `Can't draw ${category} without an index.`);
        return defined(this.note, 'NoNote', `Can't draw ${category} without a note.`);
    }
    setNote(note) {
        this.note = note;
        return this;
    }
    getIndex() {
        return this.index;
    }
    checkIndex() {
        return defined(this.index, 'NoIndex', 'Modifier has an invalid index.');
    }
    setIndex(index) {
        this.index = index;
        return this;
    }
    getModifierContext() {
        return this.modifierContext;
    }
    checkModifierContext() {
        return defined(this.modifierContext, 'NoModifierContext', 'Modifier Context Required');
    }
    setModifierContext(c) {
        this.modifierContext = c;
        return this;
    }
    getPosition() {
        return this.position;
    }
    setPosition(position) {
        this.position = typeof position === 'string' ? Modifier.PositionString[position] : position;
        this.reset();
        return this;
    }
    setTextLine(line) {
        this.text_line = line;
        return this;
    }
    setYShift(y) {
        this.y_shift = y;
        return this;
    }
    setSpacingFromNextModifier(x) {
        this.spacingFromNextModifier = x;
    }
    getSpacingFromNextModifier() {
        return this.spacingFromNextModifier;
    }
    setXShift(x) {
        this.x_shift = 0;
        if (this.position === Modifier.Position.LEFT) {
            this.x_shift -= x;
        }
        else {
            this.x_shift += x;
        }
        return this;
    }
    getXShift() {
        return this.x_shift;
    }
    draw() {
        this.checkContext();
        throw new RuntimeError('NotImplemented', 'draw() not implemented for this modifier.');
    }
    alignSubNotesWithNote(subNotes, note) {
        const tickContext = note.getTickContext();
        const metrics = tickContext.getMetrics();
        const stave = note.getStave();
        const subNoteXOffset = tickContext.getX() - metrics.modLeftPx - metrics.modRightPx + this.getSpacingFromNextModifier();
        subNotes.forEach((subNote) => {
            const subTickContext = subNote.getTickContext();
            if (stave)
                subNote.setStave(stave);
            subTickContext.setXOffset(subNoteXOffset);
        });
    }
}
