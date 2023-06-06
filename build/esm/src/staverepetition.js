import { Font, FontStyle, FontWeight } from './font.js';
import { Glyph } from './glyph.js';
import { StaveModifier } from './stavemodifier.js';
import { Tables } from './tables.js';
class Repetition extends StaveModifier {
    static get CATEGORY() {
        return "Repetition";
    }
    constructor(type, x, y_shift) {
        super();
        this.symbol_type = type;
        this.x = x;
        this.x_shift = 0;
        this.y_shift = y_shift;
        this.resetFont();
    }
    setShiftX(x) {
        this.x_shift = x;
        return this;
    }
    setShiftY(y) {
        this.y_shift = y;
        return this;
    }
    draw(stave, x) {
        this.setRendered();
        switch (this.symbol_type) {
            case Repetition.type.CODA_RIGHT:
                this.drawCodaFixed(stave, x + stave.getWidth());
                break;
            case Repetition.type.CODA_LEFT:
                this.drawSymbolText(stave, x, 'Coda', true);
                break;
            case Repetition.type.SEGNO_LEFT:
                this.drawSignoFixed(stave, x);
                break;
            case Repetition.type.SEGNO_RIGHT:
                this.drawSignoFixed(stave, x + stave.getWidth());
                break;
            case Repetition.type.DC:
                this.drawSymbolText(stave, x, 'D.C.', false);
                break;
            case Repetition.type.DC_AL_CODA:
                this.drawSymbolText(stave, x, 'D.C. al', true);
                break;
            case Repetition.type.DC_AL_FINE:
                this.drawSymbolText(stave, x, 'D.C. al Fine', false);
                break;
            case Repetition.type.DS:
                this.drawSymbolText(stave, x, 'D.S.', false);
                break;
            case Repetition.type.DS_AL_CODA:
                this.drawSymbolText(stave, x, 'D.S. al', true);
                break;
            case Repetition.type.DS_AL_FINE:
                this.drawSymbolText(stave, x, 'D.S. al Fine', false);
                break;
            case Repetition.type.FINE:
                this.drawSymbolText(stave, x, 'Fine', false);
                break;
            case Repetition.type.TO_CODA:
                this.drawSymbolText(stave, x, 'To', true);
                break;
            default:
                break;
        }
        return this;
    }
    drawCodaFixed(stave, x) {
        const y = stave.getYForTopText(stave.getNumLines()) + this.y_shift;
        Glyph.renderGlyph(stave.checkContext(), this.x + x + this.x_shift, y + Tables.currentMusicFont().lookupMetric('staveRepetition.coda.offsetY'), 40, 'coda', { category: 'coda' });
        return this;
    }
    drawSignoFixed(stave, x) {
        const y = stave.getYForTopText(stave.getNumLines()) + this.y_shift;
        Glyph.renderGlyph(stave.checkContext(), this.x + x + this.x_shift, y + Tables.currentMusicFont().lookupMetric('staveRepetition.segno.offsetY'), 30, 'segno', { category: 'segno' });
        return this;
    }
    drawSymbolText(stave, x, text, draw_coda) {
        var _a;
        const ctx = stave.checkContext();
        ctx.save();
        ctx.setFont(this.textFont);
        let text_x = 0;
        let symbol_x = 0;
        const modifierWidth = stave.getNoteStartX() - this.x;
        switch (this.symbol_type) {
            case Repetition.type.CODA_LEFT:
                text_x = this.x + stave.getVerticalBarWidth();
                symbol_x =
                    text_x +
                        ctx.measureText(text).width +
                        Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetX');
                break;
            case Repetition.type.DC:
            case Repetition.type.DC_AL_FINE:
            case Repetition.type.DS:
            case Repetition.type.DS_AL_FINE:
            case Repetition.type.FINE:
                text_x =
                    this.x +
                        x +
                        this.x_shift +
                        stave.getWidth() -
                        Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.spacing') -
                        modifierWidth -
                        ctx.measureText(text).width;
                break;
            default:
                text_x =
                    this.x +
                        x +
                        this.x_shift +
                        stave.getWidth() -
                        Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.spacing') -
                        modifierWidth -
                        ctx.measureText(text).width -
                        Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetX');
                symbol_x =
                    text_x +
                        ctx.measureText(text).width +
                        Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetX');
                break;
        }
        const y = stave.getYForTopText(stave.getNumLines()) +
            this.y_shift +
            Tables.currentMusicFont().lookupMetric('staveRepetition.symbolText.offsetY');
        if (draw_coda) {
            Glyph.renderGlyph(ctx, symbol_x, y, Font.convertSizeToPointValue((_a = this.textFont) === null || _a === void 0 ? void 0 : _a.size) * 2, 'coda', {
                category: 'coda',
            });
        }
        ctx.fillText(text, text_x, y + 5);
        ctx.restore();
        return this;
    }
}
Repetition.TEXT_FONT = {
    family: Font.SERIF,
    size: Tables.NOTATION_FONT_SCALE / 3,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
};
Repetition.type = {
    NONE: 1,
    CODA_LEFT: 2,
    CODA_RIGHT: 3,
    SEGNO_LEFT: 4,
    SEGNO_RIGHT: 5,
    DC: 6,
    DC_AL_CODA: 7,
    DC_AL_FINE: 8,
    DS: 9,
    DS_AL_CODA: 10,
    DS_AL_FINE: 11,
    FINE: 12,
    TO_CODA: 13,
};
export { Repetition };
