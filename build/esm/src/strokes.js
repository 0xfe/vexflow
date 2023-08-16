import { Font, FontStyle, FontWeight } from './font.js';
import { Glyph } from './glyph.js';
import { Modifier } from './modifier.js';
import { Tables } from './tables.js';
import { isNote, isStaveNote, isTabNote } from './typeguard.js';
import { RuntimeError } from './util.js';
class Stroke extends Modifier {
    static get CATEGORY() {
        return "Stroke";
    }
    static format(strokes, state) {
        const left_shift = state.left_shift;
        const stroke_spacing = 0;
        if (!strokes || strokes.length === 0)
            return false;
        const strokeList = strokes.map((stroke) => {
            const note = stroke.getNote();
            const index = stroke.checkIndex();
            if (isStaveNote(note)) {
                const { line } = note.getKeyProps()[index];
                const shift = note.getLeftDisplacedHeadPx();
                return { line, shift, stroke };
            }
            else if (isTabNote(note)) {
                const { str: string } = note.getPositions()[index];
                return { line: string, shift: 0, stroke };
            }
            else {
                throw new RuntimeError('Internal', 'Unexpected instance.');
            }
        });
        const strokeShift = left_shift;
        const xShift = strokeList.reduce((xShift, { stroke, shift }) => {
            stroke.setXShift(strokeShift + shift);
            return Math.max(stroke.getWidth() + stroke_spacing, xShift);
        }, 0);
        state.left_shift += xShift;
        return true;
    }
    constructor(type, options) {
        super();
        this.options = Object.assign({ all_voices: true }, options);
        this.all_voices = this.options.all_voices;
        this.type = type;
        this.position = Modifier.Position.LEFT;
        this.render_options = {
            font_scale: Tables.NOTATION_FONT_SCALE,
        };
        this.resetFont();
        this.setXShift(0);
        this.setWidth(10);
    }
    getPosition() {
        return this.position;
    }
    addEndNote(note) {
        this.note_end = note;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const start = note.getModifierStartXY(this.position, this.index);
        let ys = note.getYs();
        let topY = start.y;
        let botY = start.y;
        const x = start.x - 5;
        const line_space = note.checkStave().getSpacingBetweenLines();
        const notes = this.checkModifierContext().getMembers(note.getCategory());
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            if (isNote(note)) {
                ys = note.getYs();
                for (let n = 0; n < ys.length; n++) {
                    if (this.note === notes[i] || this.all_voices) {
                        topY = Math.min(topY, ys[n]);
                        botY = Math.max(botY, ys[n]);
                    }
                }
            }
        }
        let arrow = '';
        let arrow_shift_x = 0;
        let arrow_y = 0;
        let text_shift_x = 0;
        let text_y = 0;
        switch (this.type) {
            case Stroke.Type.BRUSH_DOWN:
                arrow = 'arrowheadBlackUp';
                arrow_shift_x = -3;
                arrow_y = topY - line_space / 2 + 10;
                botY += line_space / 2;
                break;
            case Stroke.Type.BRUSH_UP:
                arrow = 'arrowheadBlackDown';
                arrow_shift_x = 0.5;
                arrow_y = botY + line_space / 2;
                topY -= line_space / 2;
                break;
            case Stroke.Type.ROLL_DOWN:
            case Stroke.Type.RASQUEDO_DOWN:
                arrow = 'arrowheadBlackUp';
                arrow_shift_x = -3;
                text_shift_x = this.x_shift + arrow_shift_x - 2;
                if (isStaveNote(note)) {
                    topY += 1.5 * line_space;
                    if ((botY - topY) % 2 !== 0) {
                        botY += 0.5 * line_space;
                    }
                    else {
                        botY += line_space;
                    }
                    arrow_y = topY - line_space;
                    text_y = botY + line_space + 2;
                }
                else {
                    topY += 1.5 * line_space;
                    botY += line_space;
                    arrow_y = topY - 0.75 * line_space;
                    text_y = botY + 0.25 * line_space;
                }
                break;
            case Stroke.Type.ROLL_UP:
            case Stroke.Type.RASQUEDO_UP:
                arrow = 'arrowheadBlackDown';
                arrow_shift_x = -4;
                text_shift_x = this.x_shift + arrow_shift_x - 1;
                if (isStaveNote(note)) {
                    arrow_y = line_space / 2;
                    topY += 0.5 * line_space;
                    if ((botY - topY) % 2 === 0) {
                        botY += line_space / 2;
                    }
                    arrow_y = botY + 0.5 * line_space;
                    text_y = topY - 1.25 * line_space;
                }
                else {
                    topY += 0.25 * line_space;
                    botY += 0.5 * line_space;
                    arrow_y = botY + 0.25 * line_space;
                    text_y = topY - line_space;
                }
                break;
            case Stroke.Type.ARPEGGIO_DIRECTIONLESS:
                topY += 0.5 * line_space;
                botY += line_space;
                break;
            default:
                throw new RuntimeError('InvalidType', `The stroke type ${this.type} does not exist`);
        }
        let strokeLine = 'straight';
        if (this.type === Stroke.Type.BRUSH_DOWN || this.type === Stroke.Type.BRUSH_UP) {
            ctx.fillRect(x + this.x_shift, topY, 1, botY - topY);
        }
        else {
            strokeLine = 'wiggly';
            if (isStaveNote(note)) {
                for (let i = topY; i <= botY; i += line_space) {
                    Glyph.renderGlyph(ctx, x + this.x_shift - 4, i, this.render_options.font_scale, 'vexWiggleArpeggioUp');
                }
            }
            else {
                let i;
                for (i = topY; i <= botY; i += 10) {
                    Glyph.renderGlyph(ctx, x + this.x_shift - 4, i, this.render_options.font_scale, 'vexWiggleArpeggioUp');
                }
                if (this.type === Stroke.Type.RASQUEDO_DOWN) {
                    text_y = i + 0.25 * line_space;
                }
            }
        }
        if (this.type === Stroke.Type.ARPEGGIO_DIRECTIONLESS) {
            return;
        }
        Glyph.renderGlyph(ctx, x + this.x_shift + arrow_shift_x, arrow_y, this.render_options.font_scale, arrow, {
            category: `stroke_${strokeLine}.${arrow}`,
        });
        if (this.type === Stroke.Type.RASQUEDO_DOWN || this.type === Stroke.Type.RASQUEDO_UP) {
            ctx.save();
            ctx.setFont(this.textFont);
            ctx.fillText('R', x + text_shift_x, text_y);
            ctx.restore();
        }
    }
}
Stroke.Type = {
    BRUSH_DOWN: 1,
    BRUSH_UP: 2,
    ROLL_DOWN: 3,
    ROLL_UP: 4,
    RASQUEDO_DOWN: 5,
    RASQUEDO_UP: 6,
    ARPEGGIO_DIRECTIONLESS: 7,
};
Stroke.TEXT_FONT = {
    family: Font.SERIF,
    size: Font.SIZE,
    weight: FontWeight.BOLD,
    style: FontStyle.ITALIC,
};
export { Stroke };
