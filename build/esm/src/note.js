import { Font } from './font.js';
import { drawDot } from './rendercontext.js';
import { Tables } from './tables.js';
import { Tickable } from './tickable.js';
import { defined, RuntimeError } from './util.js';
export class Note extends Tickable {
    static get CATEGORY() {
        return "Note";
    }
    static plotMetrics(ctx, note, yPos) {
        const metrics = note.getMetrics();
        const xStart = note.getAbsoluteX() - metrics.modLeftPx - metrics.leftDisplacedHeadPx;
        const xPre1 = note.getAbsoluteX() - metrics.leftDisplacedHeadPx;
        const xAbs = note.getAbsoluteX();
        const xPost1 = note.getAbsoluteX() + metrics.notePx;
        const xPost2 = note.getAbsoluteX() + metrics.notePx + metrics.rightDisplacedHeadPx;
        const xEnd = note.getAbsoluteX() + metrics.notePx + metrics.rightDisplacedHeadPx + metrics.modRightPx;
        const xFreedomRight = xEnd + (note.getFormatterMetrics().freedom.right || 0);
        const xWidth = xEnd - xStart;
        ctx.save();
        ctx.setFont(Font.SANS_SERIF, 8);
        ctx.fillText(Math.round(xWidth) + 'px', xStart + note.getXShift(), yPos);
        const y = yPos + 7;
        function stroke(x1, x2, color, yy = y) {
            ctx.beginPath();
            ctx.setStrokeStyle(color);
            ctx.setFillStyle(color);
            ctx.setLineWidth(3);
            ctx.moveTo(x1 + note.getXShift(), yy);
            ctx.lineTo(x2 + note.getXShift(), yy);
            ctx.stroke();
        }
        stroke(xStart, xPre1, 'red');
        stroke(xPre1, xAbs, '#999');
        stroke(xAbs, xPost1, 'green');
        stroke(xPost1, xPost2, '#999');
        stroke(xPost2, xEnd, 'red');
        stroke(xEnd, xFreedomRight, '#DD0');
        stroke(xStart - note.getXShift(), xStart, '#BBB');
        drawDot(ctx, xAbs + note.getXShift(), y, 'blue');
        const formatterMetrics = note.getFormatterMetrics();
        if (formatterMetrics.iterations > 0) {
            const spaceDeviation = formatterMetrics.space.deviation;
            const prefix = spaceDeviation >= 0 ? '+' : '';
            ctx.setFillStyle('red');
            ctx.fillText(prefix + Math.round(spaceDeviation), xAbs + note.getXShift(), yPos - 10);
        }
        ctx.restore();
    }
    static parseDuration(durationString) {
        if (!durationString) {
            return undefined;
        }
        const regexp = /(\d*\/?\d+|[a-z])(d*)([nrhms]|$)/;
        const result = regexp.exec(durationString);
        if (!result) {
            return undefined;
        }
        const duration = result[1];
        const dots = result[2].length;
        const type = result[3] || 'n';
        return { duration, dots, type };
    }
    static parseNoteStruct(noteStruct) {
        const durationProps = Note.parseDuration(noteStruct.duration);
        if (!durationProps) {
            return undefined;
        }
        let type = noteStruct.type;
        if (type && !Tables.validTypes[type]) {
            return undefined;
        }
        const customTypes = [];
        if (!type) {
            type = durationProps.type || 'n';
            if (noteStruct.keys !== undefined) {
                noteStruct.keys.forEach((k, i) => {
                    const result = k.split('/');
                    customTypes[i] = (result && result.length === 3 ? result[2] : type);
                });
            }
        }
        let ticks = Tables.durationToTicks(durationProps.duration);
        if (!ticks) {
            return undefined;
        }
        const dots = noteStruct.dots ? noteStruct.dots : durationProps.dots;
        if (typeof dots !== 'number') {
            return undefined;
        }
        let currentTicks = ticks;
        for (let i = 0; i < dots; i++) {
            if (currentTicks <= 1)
                return undefined;
            currentTicks = currentTicks / 2;
            ticks += currentTicks;
        }
        return {
            duration: durationProps.duration,
            type,
            customTypes,
            dots,
            ticks,
        };
    }
    constructor(noteStruct) {
        super();
        if (!noteStruct) {
            throw new RuntimeError('BadArguments', 'Note must have valid initialization data to identify duration and type.');
        }
        const parsedNoteStruct = Note.parseNoteStruct(noteStruct);
        if (!parsedNoteStruct) {
            throw new RuntimeError('BadArguments', `Invalid note initialization object: ${JSON.stringify(noteStruct)}`);
        }
        this.keys = noteStruct.keys || [];
        this.keyProps = [];
        this.duration = parsedNoteStruct.duration;
        this.noteType = parsedNoteStruct.type;
        this.customTypes = parsedNoteStruct.customTypes;
        if (noteStruct.duration_override) {
            this.setDuration(noteStruct.duration_override);
        }
        else {
            this.setIntrinsicTicks(parsedNoteStruct.ticks);
        }
        this.modifiers = [];
        this.glyphProps = Tables.getGlyphProps(this.duration, this.noteType);
        this.customGlyphs = this.customTypes.map((t) => Tables.getGlyphProps(this.duration, t));
        this.playNote = undefined;
        this.ignore_ticks = false;
        this.width = 0;
        this.leftDisplacedHeadPx = 0;
        this.rightDisplacedHeadPx = 0;
        this.x_shift = 0;
        this.ys = [];
        if (noteStruct.align_center) {
            this.setCenterAlignment(noteStruct.align_center);
        }
        this.render_options = {
            annotation_spacing: 5,
            glyph_font_scale: 1,
            stroke_px: 1,
            scale: 1,
            font: '',
            y_shift: 0,
        };
    }
    getPlayNote() {
        return this.playNote;
    }
    setPlayNote(note) {
        this.playNote = note;
        return this;
    }
    isRest() {
        return false;
    }
    addStroke(index, stroke) {
        stroke.setNote(this);
        stroke.setIndex(index);
        this.modifiers.push(stroke);
        this.preFormatted = false;
        return this;
    }
    getStave() {
        return this.stave;
    }
    checkStave() {
        return defined(this.stave, 'NoStave', 'No stave attached to instance.');
    }
    setStave(stave) {
        this.stave = stave;
        this.setYs([stave.getYForLine(0)]);
        this.setContext(this.stave.getContext());
        return this;
    }
    getLeftDisplacedHeadPx() {
        return this.leftDisplacedHeadPx;
    }
    getRightDisplacedHeadPx() {
        return this.rightDisplacedHeadPx;
    }
    setLeftDisplacedHeadPx(x) {
        this.leftDisplacedHeadPx = x;
        return this;
    }
    setRightDisplacedHeadPx(x) {
        this.rightDisplacedHeadPx = x;
        return this;
    }
    shouldIgnoreTicks() {
        return this.ignore_ticks;
    }
    getLineNumber(isTopNote) {
        return 0;
    }
    getLineForRest() {
        return 0;
    }
    getGlyph() {
        return this.glyphProps;
    }
    getGlyphProps() {
        return this.glyphProps;
    }
    getGlyphWidth() {
        return this.glyphProps.getWidth(this.render_options.glyph_font_scale);
    }
    setYs(ys) {
        this.ys = ys;
        return this;
    }
    getYs() {
        if (this.ys.length === 0) {
            throw new RuntimeError('NoYValues', 'No Y-values calculated for this note.');
        }
        return this.ys;
    }
    getYForTopText(text_line) {
        return this.checkStave().getYForTopText(text_line);
    }
    getVoice() {
        if (!this.voice)
            throw new RuntimeError('NoVoice', 'Note has no voice.');
        return this.voice;
    }
    setVoice(voice) {
        this.voice = voice;
        this.preFormatted = false;
        return this;
    }
    getTickContext() {
        return this.checkTickContext();
    }
    setTickContext(tc) {
        this.tickContext = tc;
        this.preFormatted = false;
        return this;
    }
    getDuration() {
        return this.duration;
    }
    isDotted() {
        return this.getModifiersByType("Dot").length > 0;
    }
    hasStem() {
        return false;
    }
    getNoteType() {
        return this.noteType;
    }
    getBeam() {
        return this.beam;
    }
    checkBeam() {
        return defined(this.beam, 'NoBeam', 'No beam attached to instance');
    }
    hasBeam() {
        return this.beam != undefined;
    }
    setBeam(beam) {
        this.beam = beam;
        return this;
    }
    addModifier(modifier, index = 0) {
        const signature = 'Note.addModifier(modifier: Modifier, index: number=0)';
        if (typeof index === 'string') {
            index = parseInt(index);
            console.warn(signature + ' expected a number for `index`, but received a string.');
        }
        if (typeof modifier !== 'object' || typeof index !== 'number') {
            throw new RuntimeError('WrongParams', 'Incorrect call signature. Use ' + signature + ' instead.');
        }
        modifier.setNote(this);
        modifier.setIndex(index);
        super.addModifier(modifier);
        return this;
    }
    getModifiersByType(type) {
        return this.modifiers.filter((modifier) => modifier.getCategory() === type);
    }
    getModifierStartXY(position, index, options) {
        if (!this.preFormatted) {
            throw new RuntimeError('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
        }
        return {
            x: this.getAbsoluteX(),
            y: this.ys[0],
        };
    }
    getRightParenthesisPx(index) {
        const props = this.getKeyProps()[index];
        return props.displaced ? this.getRightDisplacedHeadPx() : 0;
    }
    getLeftParenthesisPx(index) {
        const props = this.getKeyProps()[index];
        return props.displaced ? this.getLeftDisplacedHeadPx() - this.x_shift : -this.x_shift;
    }
    getFirstDotPx() {
        let px = this.getRightDisplacedHeadPx();
        if (this.checkModifierContext().getMembers('Parenthesis').length !== 0)
            px += Tables.currentMusicFont().lookupMetric('parenthesis.default.width');
        return px;
    }
    getMetrics() {
        if (!this.preFormatted) {
            throw new RuntimeError('UnformattedNote', "Can't call getMetrics on an unformatted note.");
        }
        const modLeftPx = this.modifierContext ? this.modifierContext.getState().left_shift : 0;
        const modRightPx = this.modifierContext ? this.modifierContext.getState().right_shift : 0;
        const width = this.getWidth();
        const glyphWidth = this.getGlyphWidth();
        const notePx = width -
            modLeftPx -
            modRightPx -
            this.leftDisplacedHeadPx -
            this.rightDisplacedHeadPx;
        return {
            width,
            glyphWidth,
            notePx,
            modLeftPx,
            modRightPx,
            leftDisplacedHeadPx: this.leftDisplacedHeadPx,
            rightDisplacedHeadPx: this.rightDisplacedHeadPx,
            glyphPx: 0,
        };
    }
    getAbsoluteX() {
        const tickContext = this.checkTickContext(`Can't getAbsoluteX() without a TickContext.`);
        let x = tickContext.getX();
        if (this.stave) {
            x += this.stave.getNoteStartX() + Tables.currentMusicFont().lookupMetric('stave.padding');
        }
        if (this.isCenterAligned()) {
            x += this.getCenterXShift();
        }
        return x;
    }
    static getPoint(size) {
        return size == 'default' ? Tables.NOTATION_FONT_SCALE : (Tables.NOTATION_FONT_SCALE / 5) * 3;
    }
    getStemDirection() {
        throw new RuntimeError('NoStem', 'No stem attached to this note.');
    }
    getStemExtents() {
        throw new RuntimeError('NoStem', 'No stem attached to this note.');
    }
    getTieRightX() {
        let tieStartX = this.getAbsoluteX();
        const note_glyph_width = this.glyphProps.getWidth();
        tieStartX += note_glyph_width / 2;
        tieStartX += -this.width / 2 + this.width + 2;
        return tieStartX;
    }
    getTieLeftX() {
        let tieEndX = this.getAbsoluteX();
        const note_glyph_width = this.glyphProps.getWidth();
        tieEndX += note_glyph_width / 2;
        tieEndX -= this.width / 2 + 2;
        return tieEndX;
    }
    getKeys() {
        return this.keys;
    }
    getKeyProps() {
        return this.keyProps;
    }
}
