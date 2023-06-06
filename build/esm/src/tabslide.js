import { Font, FontStyle, FontWeight } from './font.js';
import { TabTie } from './tabtie.js';
import { RuntimeError } from './util.js';
class TabSlide extends TabTie {
    static get CATEGORY() {
        return "TabSlide";
    }
    static get SLIDE_UP() {
        return 1;
    }
    static get SLIDE_DOWN() {
        return -1;
    }
    static createSlideUp(notes) {
        return new TabSlide(notes, TabSlide.SLIDE_UP);
    }
    static createSlideDown(notes) {
        return new TabSlide(notes, TabSlide.SLIDE_DOWN);
    }
    constructor(notes, direction) {
        super(notes, 'sl.');
        if (!direction) {
            let first_fret = notes.first_note.getPositions()[0].fret;
            if (typeof first_fret === 'string') {
                first_fret = parseInt(first_fret, 10);
            }
            let last_fret = notes.last_note.getPositions()[0].fret;
            if (typeof last_fret === 'string') {
                last_fret = parseInt(last_fret, 10);
            }
            if (isNaN(first_fret) || isNaN(last_fret)) {
                direction = TabSlide.SLIDE_UP;
            }
            else {
                direction = first_fret > last_fret ? TabSlide.SLIDE_DOWN : TabSlide.SLIDE_UP;
            }
        }
        this.direction = direction;
        this.render_options.cp1 = 11;
        this.render_options.cp2 = 14;
        this.render_options.y_shift = 0.5;
        this.resetFont();
    }
    renderTie(params) {
        if (params.first_ys.length === 0 || params.last_ys.length === 0) {
            throw new RuntimeError('BadArguments', 'No Y-values to render');
        }
        const ctx = this.checkContext();
        const first_x_px = params.first_x_px;
        const first_ys = params.first_ys;
        const last_x_px = params.last_x_px;
        const direction = params.direction;
        if (direction !== TabSlide.SLIDE_UP && direction !== TabSlide.SLIDE_DOWN) {
            throw new RuntimeError('BadSlide', 'Invalid slide direction');
        }
        const first_indices = this.notes.first_indices;
        for (let i = 0; i < first_indices.length; ++i) {
            const slide_y = first_ys[first_indices[i]] + this.render_options.y_shift;
            if (isNaN(slide_y)) {
                throw new RuntimeError('BadArguments', 'Bad indices for slide rendering.');
            }
            ctx.beginPath();
            ctx.moveTo(first_x_px, slide_y + 3 * direction);
            ctx.lineTo(last_x_px, slide_y - 3 * direction);
            ctx.closePath();
            ctx.stroke();
        }
        this.setRendered();
    }
}
TabSlide.TEXT_FONT = {
    family: Font.SERIF,
    size: 10,
    weight: FontWeight.BOLD,
    style: FontStyle.ITALIC,
};
export { TabSlide };
