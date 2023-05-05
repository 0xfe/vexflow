import { Modifier } from './modifier.js';
import { isGraceNote, isStaveNote, isTabNote } from './typeguard.js';
import { RuntimeError } from './util.js';
export class Dot extends Modifier {
    static get CATEGORY() {
        return "Dot";
    }
    static getDots(note) {
        return note.getModifiersByType(Dot.CATEGORY);
    }
    static buildAndAttach(notes, options) {
        for (const note of notes) {
            if (options === null || options === void 0 ? void 0 : options.all) {
                for (let i = 0; i < note.keys.length; i++) {
                    const dot = new Dot();
                    dot.setDotShiftY(note.glyphProps.dot_shiftY);
                    note.addModifier(dot, i);
                }
            }
            else if ((options === null || options === void 0 ? void 0 : options.index) != undefined) {
                const dot = new Dot();
                dot.setDotShiftY(note.glyphProps.dot_shiftY);
                note.addModifier(dot, options === null || options === void 0 ? void 0 : options.index);
            }
            else {
                const dot = new Dot();
                dot.setDotShiftY(note.glyphProps.dot_shiftY);
                note.addModifier(dot, 0);
            }
        }
    }
    static format(dots, state) {
        const right_shift = state.right_shift;
        const dot_spacing = 1;
        if (!dots || dots.length === 0)
            return false;
        const dot_list = [];
        const max_shift_map = {};
        for (let i = 0; i < dots.length; ++i) {
            const dot = dots[i];
            const note = dot.getNote();
            let props;
            let shift;
            if (isStaveNote(note)) {
                const index = dot.checkIndex();
                props = note.getKeyProps()[index];
                shift = note.getFirstDotPx();
            }
            else if (isTabNote(note)) {
                props = { line: 0.5 };
                shift = right_shift;
            }
            else {
                throw new RuntimeError('Internal', 'Unexpected instance.');
            }
            const note_id = note.getAttribute('id');
            dot_list.push({ line: props.line, note, note_id, dot });
            max_shift_map[note_id] = Math.max(max_shift_map[note_id] || shift, shift);
        }
        dot_list.sort((a, b) => b.line - a.line);
        let dot_shift = right_shift;
        let x_width = 0;
        let last_line = null;
        let last_note = null;
        let prev_dotted_space = null;
        let half_shiftY = 0;
        for (let i = 0; i < dot_list.length; ++i) {
            const { dot, note, note_id, line } = dot_list[i];
            if (line !== last_line || note !== last_note) {
                dot_shift = max_shift_map[note_id];
            }
            if (!note.isRest() && line !== last_line) {
                if (Math.abs(line % 1) === 0.5) {
                    half_shiftY = 0;
                }
                else {
                    half_shiftY = 0.5;
                    if (last_note != null && !last_note.isRest() && last_line != null && last_line - line === 0.5) {
                        half_shiftY = -0.5;
                    }
                    else if (line + half_shiftY === prev_dotted_space) {
                        half_shiftY = -0.5;
                    }
                }
            }
            if (note.isRest()) {
                dot.dot_shiftY += -half_shiftY;
            }
            else {
                dot.dot_shiftY = -half_shiftY;
            }
            prev_dotted_space = line + half_shiftY;
            dot.setXShift(dot_shift);
            dot_shift += dot.getWidth() + dot_spacing;
            x_width = dot_shift > x_width ? dot_shift : x_width;
            last_line = line;
            last_note = note;
        }
        state.right_shift += x_width;
        return true;
    }
    constructor() {
        super();
        this.position = Modifier.Position.RIGHT;
        this.radius = 2;
        this.setWidth(5);
        this.dot_shiftY = 0;
    }
    setNote(note) {
        this.note = note;
        if (isGraceNote(note)) {
            this.radius *= 0.5;
            this.setWidth(3);
        }
        return this;
    }
    setDotShiftY(y) {
        this.dot_shiftY = y;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const stave = note.checkStave();
        const lineSpace = stave.getSpacingBetweenLines();
        const start = note.getModifierStartXY(this.position, this.index, { forceFlagRight: true });
        if (isTabNote(note)) {
            start.y = note.getStemExtents().baseY;
        }
        const x = start.x + this.x_shift + this.width - this.radius;
        const y = start.y + this.y_shift + this.dot_shiftY * lineSpace;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
    }
}
