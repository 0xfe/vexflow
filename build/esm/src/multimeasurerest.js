import { Element } from './element.js';
import { Glyph } from './glyph.js';
import { NoteHead } from './notehead.js';
import { StaveModifierPosition } from './stavemodifier.js';
import { Tables } from './tables.js';
import { TimeSignature } from './timesignature.js';
import { isBarline } from './typeguard.js';
import { defined } from './util.js';
let semibreve_rest;
function get_semibreve_rest() {
    if (!semibreve_rest) {
        const noteHead = new NoteHead({ duration: 'w', note_type: 'r' });
        semibreve_rest = {
            glyph_font_scale: noteHead.render_options.glyph_font_scale,
            glyph_code: noteHead.glyph_code,
            width: noteHead.getWidth(),
        };
    }
    return semibreve_rest;
}
export class MultiMeasureRest extends Element {
    static get CATEGORY() {
        return "MultiMeasureRest";
    }
    constructor(number_of_measures, options) {
        var _a;
        super();
        this.xs = { left: NaN, right: NaN };
        this.hasPaddingLeft = false;
        this.hasPaddingRight = false;
        this.hasLineThickness = false;
        this.hasSymbolSpacing = false;
        this.number_of_measures = number_of_measures;
        this.hasPaddingLeft = typeof options.padding_left === 'number';
        this.hasPaddingRight = typeof options.padding_right === 'number';
        this.hasLineThickness = typeof options.line_thickness === 'number';
        this.hasSymbolSpacing = typeof options.symbol_spacing === 'number';
        const musicFont = Tables.currentMusicFont();
        this.render_options = Object.assign({ use_symbols: false, show_number: true, number_line: -0.5, number_glyph_point: (_a = musicFont.lookupMetric('digits.point')) !== null && _a !== void 0 ? _a : Tables.NOTATION_FONT_SCALE, line: 2, spacing_between_lines_px: Tables.STAVE_LINE_DISTANCE, serif_thickness: 2, semibreve_rest_glyph_scale: Tables.NOTATION_FONT_SCALE, padding_left: 0, padding_right: 0, line_thickness: 5, symbol_spacing: 0 }, options);
        const fontLineShift = musicFont.lookupMetric('digits.shiftLine', 0);
        this.render_options.number_line += fontLineShift;
    }
    getXs() {
        return this.xs;
    }
    setStave(stave) {
        this.stave = stave;
        return this;
    }
    getStave() {
        return this.stave;
    }
    checkStave() {
        return defined(this.stave, 'NoStave', 'No stave attached to instance.');
    }
    drawLine(stave, ctx, left, right, spacingBetweenLines) {
        const options = this.render_options;
        const y = stave.getYForLine(options.line);
        const padding = (right - left) * 0.1;
        left += padding;
        right -= padding;
        let lineThicknessHalf;
        if (this.hasLineThickness) {
            lineThicknessHalf = options.line_thickness * 0.5;
        }
        else {
            lineThicknessHalf = spacingBetweenLines * 0.25;
        }
        const serifThickness = options.serif_thickness;
        const top = y - spacingBetweenLines;
        const bot = y + spacingBetweenLines;
        const leftIndented = left + serifThickness;
        const rightIndented = right - serifThickness;
        const lineTop = y - lineThicknessHalf;
        const lineBottom = y + lineThicknessHalf;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(leftIndented, top);
        ctx.lineTo(leftIndented, lineTop);
        ctx.lineTo(rightIndented, lineTop);
        ctx.lineTo(rightIndented, top);
        ctx.lineTo(right, top);
        ctx.lineTo(right, bot);
        ctx.lineTo(rightIndented, bot);
        ctx.lineTo(rightIndented, lineBottom);
        ctx.lineTo(leftIndented, lineBottom);
        ctx.lineTo(leftIndented, bot);
        ctx.lineTo(left, bot);
        ctx.closePath();
        ctx.fill();
    }
    drawSymbols(stave, ctx, left, right, spacingBetweenLines) {
        const n4 = Math.floor(this.number_of_measures / 4);
        const n = this.number_of_measures % 4;
        const n2 = Math.floor(n / 2);
        const n1 = n % 2;
        const options = this.render_options;
        semibreve_rest = undefined;
        const rest = get_semibreve_rest();
        const rest_scale = options.semibreve_rest_glyph_scale;
        const rest_width = rest.width * (rest_scale / rest.glyph_font_scale);
        const glyphs = {
            2: {
                width: rest_width * 0.5,
                height: spacingBetweenLines,
            },
            1: {
                width: rest_width,
            },
        };
        const spacing = this.hasSymbolSpacing ? options.symbol_spacing : 10;
        const width = n4 * glyphs[2].width + n2 * glyphs[2].width + n1 * glyphs[1].width + (n4 + n2 + n1 - 1) * spacing;
        let x = left + (right - left) * 0.5 - width * 0.5;
        const line = options.line;
        const yTop = stave.getYForLine(line - 1);
        const yMiddle = stave.getYForLine(line);
        const yBottom = stave.getYForLine(line + 1);
        ctx.save();
        ctx.setStrokeStyle('none');
        ctx.setLineWidth(0);
        for (let i = 0; i < n4; ++i) {
            ctx.fillRect(x, yMiddle - glyphs[2].height, glyphs[2].width, glyphs[2].height);
            ctx.fillRect(x, yBottom - glyphs[2].height, glyphs[2].width, glyphs[2].height);
            x += glyphs[2].width + spacing;
        }
        for (let i = 0; i < n2; ++i) {
            ctx.fillRect(x, yMiddle - glyphs[2].height, glyphs[2].width, glyphs[2].height);
            x += glyphs[2].width + spacing;
        }
        for (let i = 0; i < n1; ++i) {
            Glyph.renderGlyph(ctx, x, yTop, rest_scale, rest.glyph_code);
            x += glyphs[1].width + spacing;
        }
        ctx.restore();
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        const stave = this.checkStave();
        let left = stave.getNoteStartX();
        let right = stave.getNoteEndX();
        const begModifiers = stave.getModifiers(StaveModifierPosition.BEGIN);
        if (begModifiers.length === 1 && isBarline(begModifiers[0])) {
            left -= begModifiers[0].getWidth();
        }
        const options = this.render_options;
        if (this.hasPaddingLeft) {
            left = stave.getX() + options.padding_left;
        }
        if (this.hasPaddingRight) {
            right = stave.getX() + stave.getWidth() - options.padding_right;
        }
        this.xs.left = left;
        this.xs.right = right;
        const spacingBetweenLines = options.spacing_between_lines_px;
        if (options.use_symbols) {
            this.drawSymbols(stave, ctx, left, right, spacingBetweenLines);
        }
        else {
            this.drawLine(stave, ctx, left, right, spacingBetweenLines);
        }
        if (options.show_number) {
            const timeSpec = '/' + this.number_of_measures;
            const timeSig = new TimeSignature(timeSpec, 0, false);
            timeSig.point = options.number_glyph_point;
            timeSig.setTimeSig(timeSpec);
            timeSig.setStave(stave);
            timeSig.setX(left + (right - left) * 0.5 - timeSig.getInfo().glyph.getMetrics().width * 0.5);
            timeSig.bottomLine = options.number_line;
            timeSig.setContext(ctx).draw();
        }
    }
}
