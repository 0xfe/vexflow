import { Element } from './element.js';
import { Modifier } from './modifier.js';
import { RuntimeError } from './util.js';
class StaveHairpin extends Element {
    static get CATEGORY() {
        return "StaveHairpin";
    }
    static FormatByTicksAndDraw(ctx, formatter, notes, type, position, options) {
        var _a, _b;
        const ppt = formatter.pixelsPerTick;
        if (ppt == null) {
            throw new RuntimeError('BadArguments', 'A valid Formatter must be provide to draw offsets by ticks.');
        }
        const l_shift_px = ppt * ((_a = options.left_shift_ticks) !== null && _a !== void 0 ? _a : 0);
        const r_shift_px = ppt * ((_b = options.right_shift_ticks) !== null && _b !== void 0 ? _b : 0);
        const hairpin_options = {
            height: options.height,
            y_shift: options.y_shift,
            left_shift_px: l_shift_px,
            right_shift_px: r_shift_px,
            right_shift_ticks: 0,
            left_shift_ticks: 0,
        };
        new StaveHairpin({
            first_note: notes.first_note,
            last_note: notes.last_note,
        }, type)
            .setContext(ctx)
            .setRenderOptions(hairpin_options)
            .setPosition(position)
            .draw();
    }
    constructor(notes, type) {
        super();
        this.setNotes(notes);
        this.hairpin = type;
        this.position = Modifier.Position.BELOW;
        this.render_options = {
            height: 10,
            y_shift: 0,
            left_shift_px: 0,
            right_shift_px: 0,
            right_shift_ticks: 0,
            left_shift_ticks: 0,
        };
    }
    setPosition(position) {
        if (position === Modifier.Position.ABOVE || position === Modifier.Position.BELOW) {
            this.position = position;
        }
        return this;
    }
    setRenderOptions(options) {
        if (options.height != null &&
            options.y_shift != null &&
            options.left_shift_px != null &&
            options.right_shift_px != null) {
            this.render_options = options;
        }
        return this;
    }
    setNotes(notes) {
        if (!notes.first_note && !notes.last_note) {
            throw new RuntimeError('BadArguments', 'Hairpin needs to have either first_note or last_note set.');
        }
        this.notes = notes;
        this.first_note = notes.first_note;
        this.last_note = notes.last_note;
        return this;
    }
    renderHairpin(params) {
        const ctx = this.checkContext();
        let dis = this.render_options.y_shift + 20;
        let y_shift = params.first_y;
        if (this.position === Modifier.Position.ABOVE) {
            dis = -dis + 30;
            y_shift = params.first_y - params.staff_height;
        }
        const l_shift = this.render_options.left_shift_px;
        const r_shift = this.render_options.right_shift_px;
        ctx.beginPath();
        switch (this.hairpin) {
            case StaveHairpin.type.CRESC:
                ctx.moveTo(params.last_x + r_shift, y_shift + dis);
                ctx.lineTo(params.first_x + l_shift, y_shift + this.render_options.height / 2 + dis);
                ctx.lineTo(params.last_x + r_shift, y_shift + this.render_options.height + dis);
                break;
            case StaveHairpin.type.DECRESC:
                ctx.moveTo(params.first_x + l_shift, y_shift + dis);
                ctx.lineTo(params.last_x + r_shift, y_shift + this.render_options.height / 2 + dis);
                ctx.lineTo(params.first_x + l_shift, y_shift + this.render_options.height + dis);
                break;
            default:
                break;
        }
        ctx.stroke();
        ctx.closePath();
    }
    draw() {
        this.checkContext();
        this.setRendered();
        const firstNote = this.first_note;
        const lastNote = this.last_note;
        if (!firstNote || !lastNote)
            throw new RuntimeError('NoNote', 'Notes required to draw');
        const start = firstNote.getModifierStartXY(this.position, 0);
        const end = lastNote.getModifierStartXY(this.position, 0);
        this.renderHairpin({
            first_x: start.x,
            last_x: end.x,
            first_y: firstNote.checkStave().getY() + firstNote.checkStave().getHeight(),
            last_y: lastNote.checkStave().getY() + lastNote.checkStave().getHeight(),
            staff_height: firstNote.checkStave().getHeight(),
        });
    }
}
StaveHairpin.type = {
    CRESC: 1,
    DECRESC: 2,
};
export { StaveHairpin };
