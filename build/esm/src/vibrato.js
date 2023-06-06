import { Bend } from './bend.js';
import { Modifier } from './modifier.js';
import { Tables } from './tables.js';
export class Vibrato extends Modifier {
    static get CATEGORY() {
        return "Vibrato";
    }
    static format(vibratos, state, context) {
        if (!vibratos || vibratos.length === 0)
            return false;
        let text_line = state.top_text_line;
        let width = 0;
        let shift = state.right_shift - 7;
        const bends = context.getMembers(Bend.CATEGORY);
        if (bends && bends.length > 0) {
            const bendHeight = bends.map((bb) => bb.getTextHeight()).reduce((a, b) => (a > b ? a : b)) / Tables.STAVE_LINE_DISTANCE;
            text_line = text_line - (bendHeight + 1);
        }
        else {
            state.top_text_line += 1;
        }
        for (let i = 0; i < vibratos.length; ++i) {
            const vibrato = vibratos[i];
            vibrato.setXShift(shift);
            vibrato.setTextLine(text_line);
            width += vibrato.getWidth();
            shift += width;
        }
        state.right_shift += width;
        return true;
    }
    constructor() {
        super();
        this.position = Modifier.Position.RIGHT;
        this.render_options = {
            harsh: false,
            vibrato_width: 20,
            wave_height: 6,
            wave_width: 4,
            wave_girth: 2,
        };
        this.setVibratoWidth(this.render_options.vibrato_width);
    }
    setHarsh(harsh) {
        this.render_options.harsh = harsh;
        return this;
    }
    setVibratoWidth(width) {
        this.render_options.vibrato_width = width;
        this.setWidth(width);
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const start = note.getModifierStartXY(Modifier.Position.RIGHT, this.index);
        const vx = start.x + this.x_shift;
        const vy = note.getYForTopText(this.text_line) + 2;
        Vibrato.renderVibrato(ctx, vx, vy, this.render_options);
    }
    static renderVibrato(ctx, x, y, opts) {
        const { harsh, vibrato_width, wave_width, wave_girth, wave_height } = opts;
        const num_waves = vibrato_width / wave_width;
        ctx.beginPath();
        let i;
        if (harsh) {
            ctx.moveTo(x, y + wave_girth + 1);
            for (i = 0; i < num_waves / 2; ++i) {
                ctx.lineTo(x + wave_width, y - wave_height / 2);
                x += wave_width;
                ctx.lineTo(x + wave_width, y + wave_height / 2);
                x += wave_width;
            }
            for (i = 0; i < num_waves / 2; ++i) {
                ctx.lineTo(x - wave_width, y - wave_height / 2 + wave_girth + 1);
                x -= wave_width;
                ctx.lineTo(x - wave_width, y + wave_height / 2 + wave_girth + 1);
                x -= wave_width;
            }
            ctx.fill();
        }
        else {
            ctx.moveTo(x, y + wave_girth);
            for (i = 0; i < num_waves / 2; ++i) {
                ctx.quadraticCurveTo(x + wave_width / 2, y - wave_height / 2, x + wave_width, y);
                x += wave_width;
                ctx.quadraticCurveTo(x + wave_width / 2, y + wave_height / 2, x + wave_width, y);
                x += wave_width;
            }
            for (i = 0; i < num_waves / 2; ++i) {
                ctx.quadraticCurveTo(x - wave_width / 2, y + wave_height / 2 + wave_girth, x - wave_width, y + wave_girth);
                x -= wave_width;
                ctx.quadraticCurveTo(x - wave_width / 2, y - wave_height / 2 + wave_girth, x - wave_width, y + wave_girth);
                x -= wave_width;
            }
            ctx.fill();
        }
    }
}
