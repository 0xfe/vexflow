import { Element } from './element.js';
import { Font, FontStyle, FontWeight } from './font.js';
import { Glyph } from './glyph.js';
import { Tables } from './tables.js';
import { log, RuntimeError } from './util.js';
function L(...args) {
    if (PedalMarking.DEBUG)
        log('Vex.Flow.PedalMarking', args);
}
function drawPedalGlyph(name, context, x, y, point) {
    const glyph_data = PedalMarking.GLYPHS[name];
    const glyph = new Glyph(glyph_data.code, point, { category: 'pedalMarking' });
    glyph.render(context, x - (glyph.getMetrics().width - Tables.STAVE_LINE_DISTANCE) / 2, y);
}
class PedalMarking extends Element {
    static get CATEGORY() {
        return "PedalMarking";
    }
    static createSustain(notes) {
        const pedal = new PedalMarking(notes);
        return pedal;
    }
    static createSostenuto(notes) {
        const pedal = new PedalMarking(notes);
        pedal.setType(PedalMarking.type.MIXED);
        pedal.setCustomText('Sost. Ped.');
        return pedal;
    }
    static createUnaCorda(notes) {
        const pedal = new PedalMarking(notes);
        pedal.setType(PedalMarking.type.TEXT);
        pedal.setCustomText('una corda', 'tre corda');
        return pedal;
    }
    constructor(notes) {
        super();
        this.notes = notes;
        this.type = PedalMarking.type.TEXT;
        this.line = 0;
        this.custom_depress_text = '';
        this.custom_release_text = '';
        this.resetFont();
        this.render_options = {
            bracket_height: 10,
            text_margin_right: 6,
            bracket_line_width: 1,
            color: 'black',
        };
    }
    setType(type) {
        type = typeof type === 'string' ? PedalMarking.typeString[type] : type;
        if (type >= PedalMarking.type.TEXT && type <= PedalMarking.type.MIXED) {
            this.type = type;
        }
        return this;
    }
    setCustomText(depress, release) {
        this.custom_depress_text = depress || '';
        this.custom_release_text = release || '';
        return this;
    }
    setLine(line) {
        this.line = line;
        return this;
    }
    drawBracketed() {
        const ctx = this.checkContext();
        let is_pedal_depressed = false;
        let prev_x;
        let prev_y;
        this.notes.forEach((note, index, notes) => {
            var _a;
            is_pedal_depressed = !is_pedal_depressed;
            const x = note.getAbsoluteX();
            const y = note.checkStave().getYForBottomText(this.line + 3);
            if (x < prev_x) {
                throw new RuntimeError('InvalidConfiguration', 'The notes provided must be in order of ascending x positions');
            }
            const next_is_same = notes[index + 1] === note;
            const prev_is_same = notes[index - 1] === note;
            let x_shift = 0;
            const point = (_a = Tables.currentMusicFont().lookupMetric(`pedalMarking.${is_pedal_depressed ? 'down' : 'up'}.point`)) !== null && _a !== void 0 ? _a : Tables.NOTATION_FONT_SCALE;
            if (is_pedal_depressed) {
                x_shift = prev_is_same ? 5 : 0;
                if (this.type === PedalMarking.type.MIXED && !prev_is_same) {
                    if (this.custom_depress_text) {
                        const text_width = ctx.measureText(this.custom_depress_text).width;
                        ctx.fillText(this.custom_depress_text, x - text_width / 2, y);
                        x_shift = text_width / 2 + this.render_options.text_margin_right;
                    }
                    else {
                        drawPedalGlyph('pedal_depress', ctx, x, y, point);
                        x_shift = 20 + this.render_options.text_margin_right;
                    }
                }
                else {
                    ctx.beginPath();
                    ctx.moveTo(x, y - this.render_options.bracket_height);
                    ctx.lineTo(x + x_shift, y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
            else {
                x_shift = next_is_same ? -5 : 0;
                ctx.beginPath();
                ctx.moveTo(prev_x, prev_y);
                ctx.lineTo(x + x_shift, y);
                ctx.lineTo(x, y - this.render_options.bracket_height);
                ctx.stroke();
                ctx.closePath();
            }
            prev_x = x + x_shift;
            prev_y = y;
        });
    }
    drawText() {
        const ctx = this.checkContext();
        let is_pedal_depressed = false;
        this.notes.forEach((note) => {
            var _a;
            is_pedal_depressed = !is_pedal_depressed;
            const stave = note.checkStave();
            const x = note.getAbsoluteX();
            const y = stave.getYForBottomText(this.line + 3);
            const point = (_a = Tables.currentMusicFont().lookupMetric(`pedalMarking.${is_pedal_depressed ? 'down' : 'up'}.point`)) !== null && _a !== void 0 ? _a : Tables.NOTATION_FONT_SCALE;
            let text_width = 0;
            if (is_pedal_depressed) {
                if (this.custom_depress_text) {
                    text_width = ctx.measureText(this.custom_depress_text).width;
                    ctx.fillText(this.custom_depress_text, x - text_width / 2, y);
                }
                else {
                    drawPedalGlyph('pedal_depress', ctx, x, y, point);
                }
            }
            else {
                if (this.custom_release_text) {
                    text_width = ctx.measureText(this.custom_release_text).width;
                    ctx.fillText(this.custom_release_text, x - text_width / 2, y);
                }
                else {
                    drawPedalGlyph('pedal_release', ctx, x, y, point);
                }
            }
        });
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        ctx.save();
        ctx.setStrokeStyle(this.render_options.color);
        ctx.setFillStyle(this.render_options.color);
        ctx.setFont(this.textFont);
        L('Rendering Pedal Marking');
        if (this.type === PedalMarking.type.BRACKET || this.type === PedalMarking.type.MIXED) {
            ctx.setLineWidth(this.render_options.bracket_line_width);
            this.drawBracketed();
        }
        else if (this.type === PedalMarking.type.TEXT) {
            this.drawText();
        }
        ctx.restore();
    }
}
PedalMarking.DEBUG = false;
PedalMarking.TEXT_FONT = {
    family: Font.SERIF,
    size: 12,
    weight: FontWeight.BOLD,
    style: FontStyle.ITALIC,
};
PedalMarking.GLYPHS = {
    pedal_depress: {
        code: 'keyboardPedalPed',
    },
    pedal_release: {
        code: 'keyboardPedalUp',
    },
};
PedalMarking.type = {
    TEXT: 1,
    BRACKET: 2,
    MIXED: 3,
};
PedalMarking.typeString = {
    text: PedalMarking.type.TEXT,
    bracket: PedalMarking.type.BRACKET,
    mixed: PedalMarking.type.MIXED,
};
export { PedalMarking };
