import { Element } from './element.js';
import { RuntimeError } from './util.js';
class StaveTie extends Element {
    static get CATEGORY() {
        return "StaveTie";
    }
    constructor(notes, text) {
        super();
        this.setNotes(notes);
        this.text = text;
        this.render_options = {
            cp1: 8,
            cp2: 12,
            text_shift_x: 0,
            first_x_shift: 0,
            last_x_shift: 0,
            y_shift: 7,
            tie_spacing: 0,
        };
        this.resetFont();
    }
    setDirection(direction) {
        this.direction = direction;
        return this;
    }
    setNotes(notes) {
        if (!notes.first_note && !notes.last_note) {
            throw new RuntimeError('BadArguments', 'Tie needs to have either first_note or last_note set.');
        }
        if (!notes.first_indices) {
            notes.first_indices = [0];
        }
        if (!notes.last_indices) {
            notes.last_indices = [0];
        }
        if (notes.first_indices.length !== notes.last_indices.length) {
            throw new RuntimeError('BadArguments', 'Tied notes must have same number of indices.');
        }
        this.notes = notes;
        return this;
    }
    isPartial() {
        return !this.notes.first_note || !this.notes.last_note;
    }
    renderTie(params) {
        if (params.first_ys.length === 0 || params.last_ys.length === 0) {
            throw new RuntimeError('BadArguments', 'No Y-values to render');
        }
        const ctx = this.checkContext();
        let cp1 = this.render_options.cp1;
        let cp2 = this.render_options.cp2;
        if (Math.abs(params.last_x_px - params.first_x_px) < 10) {
            cp1 = 2;
            cp2 = 8;
        }
        const first_x_shift = this.render_options.first_x_shift;
        const last_x_shift = this.render_options.last_x_shift;
        const y_shift = this.render_options.y_shift * params.direction;
        const first_indices = this.notes.first_indices;
        const last_indices = this.notes.last_indices;
        this.applyStyle();
        ctx.openGroup('stavetie', this.getAttribute('id'));
        for (let i = 0; i < first_indices.length; ++i) {
            const cp_x = (params.last_x_px + last_x_shift + (params.first_x_px + first_x_shift)) / 2;
            const first_y_px = params.first_ys[first_indices[i]] + y_shift;
            const last_y_px = params.last_ys[last_indices[i]] + y_shift;
            if (isNaN(first_y_px) || isNaN(last_y_px)) {
                throw new RuntimeError('BadArguments', 'Bad indices for tie rendering.');
            }
            const top_cp_y = (first_y_px + last_y_px) / 2 + cp1 * params.direction;
            const bottom_cp_y = (first_y_px + last_y_px) / 2 + cp2 * params.direction;
            ctx.beginPath();
            ctx.moveTo(params.first_x_px + first_x_shift, first_y_px);
            ctx.quadraticCurveTo(cp_x, top_cp_y, params.last_x_px + last_x_shift, last_y_px);
            ctx.quadraticCurveTo(cp_x, bottom_cp_y, params.first_x_px + first_x_shift, first_y_px);
            ctx.closePath();
            ctx.fill();
        }
        ctx.closeGroup();
        this.restoreStyle();
    }
    renderText(first_x_px, last_x_px) {
        var _a, _b, _c;
        if (!this.text)
            return;
        const ctx = this.checkContext();
        let center_x = (first_x_px + last_x_px) / 2;
        center_x -= ctx.measureText(this.text).width / 2;
        const stave = (_b = (_a = this.notes.first_note) === null || _a === void 0 ? void 0 : _a.checkStave()) !== null && _b !== void 0 ? _b : (_c = this.notes.last_note) === null || _c === void 0 ? void 0 : _c.checkStave();
        if (stave) {
            ctx.save();
            ctx.setFont(this.textFont);
            ctx.fillText(this.text, center_x + this.render_options.text_shift_x, stave.getYForTopText() - 1);
            ctx.restore();
        }
    }
    getNotes() {
        return this.notes;
    }
    draw() {
        this.checkContext();
        this.setRendered();
        const first_note = this.notes.first_note;
        const last_note = this.notes.last_note;
        let first_x_px = 0;
        let last_x_px = 0;
        let first_ys = [0];
        let last_ys = [0];
        let stem_direction = 0;
        if (first_note) {
            first_x_px = first_note.getTieRightX() + this.render_options.tie_spacing;
            stem_direction = first_note.getStemDirection();
            first_ys = first_note.getYs();
        }
        else if (last_note) {
            const stave = last_note.checkStave();
            first_x_px = stave.getTieStartX();
            first_ys = last_note.getYs();
            this.notes.first_indices = this.notes.last_indices;
        }
        if (last_note) {
            last_x_px = last_note.getTieLeftX() + this.render_options.tie_spacing;
            stem_direction = last_note.getStemDirection();
            last_ys = last_note.getYs();
        }
        else if (first_note) {
            const stave = first_note.checkStave();
            last_x_px = stave.getTieEndX();
            last_ys = first_note.getYs();
            this.notes.last_indices = this.notes.first_indices;
        }
        if (this.direction) {
            stem_direction = this.direction;
        }
        this.renderTie({
            first_x_px,
            last_x_px,
            first_ys,
            last_ys,
            direction: stem_direction,
        });
        this.renderText(first_x_px, last_x_px);
        return true;
    }
}
StaveTie.TEXT_FONT = Object.assign({}, Element.TEXT_FONT);
export { StaveTie };
