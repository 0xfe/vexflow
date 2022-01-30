import { Font } from './font.js';
import { Glyph } from './glyph.js';
import { Modifier } from './modifier.js';
import { Stem } from './stem.js';
import { StemmableNote } from './stemmablenote.js';
import { Tables } from './tables.js';
import { isDot } from './typeguard.js';
import { defined, RuntimeError } from './util.js';
function getUnusedStringGroups(num_lines, strings_used) {
    const stem_through = [];
    let group = [];
    for (let string = 1; string <= num_lines; string++) {
        const is_used = strings_used.indexOf(string) > -1;
        if (!is_used) {
            group.push(string);
        }
        else {
            stem_through.push(group);
            group = [];
        }
    }
    if (group.length > 0)
        stem_through.push(group);
    return stem_through;
}
function getPartialStemLines(stem_y, unused_strings, stave, stem_direction) {
    const up_stem = stem_direction !== 1;
    const down_stem = stem_direction !== -1;
    const line_spacing = stave.getSpacingBetweenLines();
    const total_lines = stave.getNumLines();
    const stem_lines = [];
    unused_strings.forEach((strings) => {
        const containsLastString = strings.indexOf(total_lines) > -1;
        const containsFirstString = strings.indexOf(1) > -1;
        if ((up_stem && containsFirstString) || (down_stem && containsLastString)) {
            return;
        }
        if (strings.length === 1) {
            strings.push(strings[0]);
        }
        const line_ys = [];
        strings.forEach((string, index, strings) => {
            const isTopBound = string === 1;
            const isBottomBound = string === total_lines;
            let y = stave.getYForLine(string - 1);
            if (index === 0 && !isTopBound) {
                y -= line_spacing / 2 - 1;
            }
            else if (index === strings.length - 1 && !isBottomBound) {
                y += line_spacing / 2 - 1;
            }
            line_ys.push(y);
            if (stem_direction === 1 && isTopBound) {
                line_ys.push(stem_y - 2);
            }
            else if (stem_direction === -1 && isBottomBound) {
                line_ys.push(stem_y + 2);
            }
        });
        stem_lines.push(line_ys.sort((a, b) => a - b));
    });
    return stem_lines;
}
export class TabNote extends StemmableNote {
    constructor(noteStruct, draw_stem = false) {
        super(noteStruct);
        this.glyphs = [];
        this.greatestString = () => {
            return this.positions.map((x) => x.str).reduce((a, b) => (a > b ? a : b));
        };
        this.leastString = () => {
            return this.positions.map((x) => x.str).reduce((a, b) => (a < b ? a : b));
        };
        this.ghost = false;
        this.positions = noteStruct.positions || [];
        this.render_options = Object.assign(Object.assign({}, this.render_options), { glyph_font_scale: Tables.TABLATURE_FONT_SCALE, draw_stem, draw_dots: draw_stem, draw_stem_through_stave: false, y_shift: 0, scale: 1.0, font: `${Font.SIZE}pt ${Font.SANS_SERIF}` });
        this.glyph = Tables.getGlyphProps(this.duration, this.noteType);
        defined(this.glyph, 'BadArguments', `No glyph found for duration '${this.duration}' and type '${this.noteType}'`);
        this.buildStem();
        if (noteStruct.stem_direction) {
            this.setStemDirection(noteStruct.stem_direction);
        }
        else {
            this.setStemDirection(Stem.UP);
        }
        this.ghost = false;
        this.updateWidth();
    }
    static get CATEGORY() {
        return "TabNote";
    }
    reset() {
        super.reset();
        if (this.stave)
            this.setStave(this.stave);
        return this;
    }
    setGhost(ghost) {
        this.ghost = ghost;
        this.updateWidth();
        return this;
    }
    hasStem() {
        if (this.render_options.draw_stem)
            return true;
        return false;
    }
    getStemExtension() {
        if (this.stem_extension_override != null) {
            return this.stem_extension_override;
        }
        if (this.flag) {
            return this.getStemDirection() === 1 ? -this.flag.checkMetrics().y_shift : this.flag.checkMetrics().y_shift;
        }
        return 0;
    }
    updateWidth() {
        this.glyphs = [];
        this.width = 0;
        for (let i = 0; i < this.positions.length; ++i) {
            let fret = this.positions[i].fret;
            if (this.ghost)
                fret = '(' + fret + ')';
            const glyph = Tables.tabToGlyph(fret.toString(), this.render_options.scale);
            this.glyphs.push(glyph);
            this.width = Math.max(glyph.getWidth(), this.width);
        }
        this.glyph.getWidth = () => this.width;
    }
    setStave(stave) {
        super.setStave(stave);
        const ctx = stave.getContext();
        this.setContext(ctx);
        if (ctx) {
            this.width = 0;
            for (let i = 0; i < this.glyphs.length; ++i) {
                const glyph = this.glyphs[i];
                const text = '' + glyph.text;
                if (text.toUpperCase() !== 'X') {
                    ctx.save();
                    ctx.setFont(this.render_options.font);
                    glyph.width = ctx.measureText(text).width;
                    ctx.restore();
                    glyph.getWidth = () => glyph.width;
                }
                this.width = Math.max(glyph.getWidth(), this.width);
            }
            this.glyph.getWidth = () => this.width;
        }
        const ys = this.positions.map(({ str: line }) => stave.getYForLine(Number(line) - 1));
        this.setYs(ys);
        if (this.stem) {
            this.stem.setYBounds(this.getStemY(), this.getStemY());
        }
        return this;
    }
    getPositions() {
        return this.positions;
    }
    getModifierStartXY(position, index) {
        if (!this.preFormatted) {
            throw new RuntimeError('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
        }
        if (this.ys.length === 0) {
            throw new RuntimeError('NoYValues', 'No Y-Values calculated for this note.');
        }
        let x = 0;
        if (position === Modifier.Position.LEFT) {
            x = -1 * 2;
        }
        else if (position === Modifier.Position.RIGHT) {
            x = this.width + 2;
        }
        else if (position === Modifier.Position.BELOW || position === Modifier.Position.ABOVE) {
            const note_glyph_width = this.glyph.getWidth();
            x = note_glyph_width / 2;
        }
        return {
            x: this.getAbsoluteX() + x,
            y: this.ys[index],
        };
    }
    getLineForRest() {
        return Number(this.positions[0].str);
    }
    preFormat() {
        if (this.preFormatted)
            return;
        if (this.modifierContext)
            this.modifierContext.preFormat();
        this.preFormatted = true;
    }
    getStemX() {
        return this.getCenterGlyphX();
    }
    getStemY() {
        const num_lines = this.checkStave().getNumLines();
        const stemUpLine = -0.5;
        const stemDownLine = num_lines - 0.5;
        const stemStartLine = Stem.UP === this.stem_direction ? stemUpLine : stemDownLine;
        return this.checkStave().getYForLine(stemStartLine);
    }
    getStemExtents() {
        return this.checkStem().getExtents();
    }
    drawFlag() {
        const { beam, glyph, stem_direction, render_options: { draw_stem, glyph_font_scale }, } = this;
        const context = this.checkContext();
        const shouldDrawFlag = beam == undefined && draw_stem;
        if (glyph.flag && shouldDrawFlag) {
            const flag_x = this.getStemX() + 1;
            const flag_y = this.getStemY() - this.checkStem().getHeight();
            const flag_code = stem_direction === Stem.DOWN
                ? glyph.code_flag_downstem
                : glyph.code_flag_upstem;
            Glyph.renderGlyph(context, flag_x, flag_y, glyph_font_scale, flag_code, { category: 'flag.tabStem' });
        }
    }
    drawModifiers() {
        this.modifiers.forEach((modifier) => {
            if (isDot(modifier) && !this.render_options.draw_dots) {
                return;
            }
            modifier.setContext(this.getContext());
            modifier.drawWithStyle();
        });
    }
    drawStemThrough() {
        const stemX = this.getStemX();
        const stemY = this.getStemY();
        const ctx = this.checkContext();
        const drawStem = this.render_options.draw_stem;
        const stemThrough = this.render_options.draw_stem_through_stave;
        if (drawStem && stemThrough) {
            const numLines = this.checkStave().getNumLines();
            const stringsUsed = this.positions.map((position) => Number(position.str));
            const unusedStrings = getUnusedStringGroups(numLines, stringsUsed);
            const stemLines = getPartialStemLines(stemY, unusedStrings, this.checkStave(), this.getStemDirection());
            ctx.save();
            ctx.setLineWidth(Stem.WIDTH);
            stemLines.forEach((bounds) => {
                if (bounds.length === 0)
                    return;
                ctx.beginPath();
                ctx.moveTo(stemX, bounds[0]);
                ctx.lineTo(stemX, bounds[bounds.length - 1]);
                ctx.stroke();
                ctx.closePath();
            });
            ctx.restore();
        }
    }
    drawPositions() {
        const ctx = this.checkContext();
        const x = this.getAbsoluteX();
        const ys = this.ys;
        for (let i = 0; i < this.positions.length; ++i) {
            const y = ys[i] + this.render_options.y_shift;
            const glyph = this.glyphs[i];
            const note_glyph_width = this.glyph.getWidth();
            const tab_x = x + note_glyph_width / 2 - glyph.getWidth() / 2;
            ctx.clearRect(tab_x - 2, y - 3, glyph.getWidth() + 4, 6);
            if (glyph.code) {
                Glyph.renderGlyph(ctx, tab_x, y, this.render_options.glyph_font_scale * this.render_options.scale, glyph.code);
            }
            else {
                ctx.save();
                ctx.setFont(this.render_options.font);
                const text = glyph.text.toString();
                ctx.fillText(text, tab_x, y + 5 * this.render_options.scale);
                ctx.restore();
            }
        }
    }
    draw() {
        const ctx = this.checkContext();
        if (this.ys.length === 0) {
            throw new RuntimeError('NoYValues', "Can't draw note without Y values.");
        }
        this.setRendered();
        const render_stem = this.beam == undefined && this.render_options.draw_stem;
        ctx.openGroup('tabnote', undefined, { pointerBBox: true });
        this.drawPositions();
        this.drawStemThrough();
        if (this.stem && render_stem) {
            const stem_x = this.getStemX();
            this.stem.setNoteHeadXBounds(stem_x, stem_x);
            ctx.openGroup('stem', undefined, { pointerBBox: true });
            this.stem.setContext(ctx).draw();
            ctx.closeGroup();
        }
        this.drawFlag();
        this.drawModifiers();
        ctx.closeGroup();
    }
}
