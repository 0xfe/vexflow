import { Font, FontStyle, FontWeight } from './font.js';
import { Glyph } from './glyph.js';
import { StaveModifier, StaveModifierPosition } from './stavemodifier.js';
import { Tables } from './tables.js';
export class StaveTempo extends StaveModifier {
    constructor(tempo, x, shift_y) {
        super();
        this.render_options = { glyph_font_scale: 30 };
        this.tempo = tempo;
        this.position = StaveModifierPosition.ABOVE;
        this.x = x;
        this.shift_x = 10;
        this.shift_y = shift_y;
        this.resetFont();
    }
    static get CATEGORY() {
        return "StaveTempo";
    }
    setTempo(tempo) {
        this.tempo = tempo;
        return this;
    }
    setShiftX(x) {
        this.shift_x = x;
        return this;
    }
    setShiftY(y) {
        this.shift_y = y;
        return this;
    }
    draw(stave, shift_x) {
        const ctx = stave.checkContext();
        this.setRendered();
        const options = this.render_options;
        const scale = options.glyph_font_scale / 38;
        const name = this.tempo.name;
        const duration = this.tempo.duration;
        const dots = this.tempo.dots || 0;
        const bpm = this.tempo.bpm;
        let x = this.x + this.shift_x + shift_x;
        const y = stave.getYForTopText(1) + this.shift_y;
        ctx.save();
        if (name) {
            ctx.setFont(this.textFont);
            ctx.fillText(name, x, y);
            x += ctx.measureText(name).width;
        }
        if (duration && bpm) {
            ctx.setFont(Object.assign(Object.assign({}, this.textFont), { weight: 'normal', style: 'normal' }));
            if (name) {
                x += ctx.measureText(' ').width;
                ctx.fillText('(', x, y);
                x += ctx.measureText('(').width;
            }
            const code = Tables.getGlyphProps(duration);
            x += 3 * scale;
            Glyph.renderGlyph(ctx, x, y, options.glyph_font_scale, code.code_head);
            x += code.getWidth() * scale;
            if (code.stem) {
                let stem_height = 30;
                if (code.beam_count)
                    stem_height += 3 * (code.beam_count - 1);
                stem_height *= scale;
                const y_top = y - stem_height;
                ctx.fillRect(x - scale, y_top, scale, stem_height);
                if (code.flag) {
                    Glyph.renderGlyph(ctx, x, y_top, options.glyph_font_scale, code.code_flag_upstem, {
                        category: 'flag.staveTempo',
                    });
                    if (!dots)
                        x += 6 * scale;
                }
            }
            for (let i = 0; i < dots; i++) {
                x += 6 * scale;
                ctx.beginPath();
                ctx.arc(x, y + 2 * scale, 2 * scale, 0, Math.PI * 2, false);
                ctx.fill();
            }
            ctx.fillText(' = ' + bpm + (name ? ')' : ''), x + 3 * scale, y);
        }
        ctx.restore();
        return this;
    }
}
StaveTempo.TEXT_FONT = {
    family: Font.SERIF,
    size: 14,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
};
