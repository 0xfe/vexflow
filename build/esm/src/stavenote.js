import { BoundingBox } from './boundingbox.js';
import { Modifier } from './modifier.js';
import { NoteHead } from './notehead.js';
import { Stem } from './stem.js';
import { StemmableNote } from './stemmablenote.js';
import { Tables } from './tables.js';
import { defined, log, midLine, RuntimeError } from './util.js';
function showDeprecationWarningForNoteHeads() {
    console.warn('StaveNote.note_heads is deprecated. Use StaveNote.noteHeads instead.', 'This accessor will be removed in VexFlow 5.0.');
}
function L(...args) {
    if (StaveNote.DEBUG)
        log('Vex.Flow.StaveNote', args);
}
const isInnerNoteIndex = (note, index) => index === (note.getStemDirection() === Stem.UP ? note.keyProps.length - 1 : 0);
function shiftRestVertical(rest, note, dir) {
    const delta = dir;
    rest.line += delta;
    rest.maxLine += delta;
    rest.minLine += delta;
    rest.note.setKeyLine(0, rest.note.getKeyLine(0) + delta);
}
function centerRest(rest, noteU, noteL) {
    const delta = rest.line - midLine(noteU.minLine, noteL.maxLine);
    rest.note.setKeyLine(0, rest.note.getKeyLine(0) - delta);
    rest.line -= delta;
    rest.maxLine -= delta;
    rest.minLine -= delta;
}
class StaveNote extends StemmableNote {
    static get CATEGORY() {
        return "StaveNote";
    }
    static get STEM_UP() {
        return Stem.UP;
    }
    static get STEM_DOWN() {
        return Stem.DOWN;
    }
    static get LEDGER_LINE_OFFSET() {
        return 3;
    }
    static get minNoteheadPadding() {
        const musicFont = Tables.currentMusicFont();
        return musicFont.lookupMetric('noteHead.minPadding');
    }
    static format(notes, state) {
        var _a, _b;
        if (!notes || notes.length < 2)
            return false;
        const notesList = [];
        for (let i = 0; i < notes.length; i++) {
            const props = notes[i].sortedKeyProps;
            const line = props[0].keyProps.line;
            let minL = props[props.length - 1].keyProps.line;
            const stemDirection = notes[i].getStemDirection();
            const stemMax = notes[i].getStemLength() / 10;
            const stemMin = notes[i].getStemMinimumLength() / 10;
            let maxL;
            if (notes[i].isRest()) {
                maxL = line + notes[i].glyphProps.line_above;
                minL = line - notes[i].glyphProps.line_below;
            }
            else {
                maxL =
                    stemDirection === 1 ? props[props.length - 1].keyProps.line + stemMax : props[props.length - 1].keyProps.line;
                minL = stemDirection === 1 ? props[0].keyProps.line : props[0].keyProps.line - stemMax;
            }
            notesList.push({
                line: props[0].keyProps.line,
                maxLine: maxL,
                minLine: minL,
                isrest: notes[i].isRest(),
                stemDirection: stemDirection,
                stemMax,
                stemMin,
                voice_shift: notes[i].getVoiceShiftWidth(),
                is_displaced: notes[i].isDisplaced(),
                note: notes[i],
            });
        }
        let voices = 0;
        let noteU = undefined;
        let noteM = undefined;
        let noteL = undefined;
        const draw = [false, false, false];
        for (let i = 0; i < notesList.length; i++) {
            draw[i] = notesList[i].note.render_options.draw == false ? false : true;
        }
        if (draw[0] && draw[1] && draw[2]) {
            voices = 3;
            noteU = notesList[0];
            noteM = notesList[1];
            noteL = notesList[2];
        }
        else if (draw[0] && draw[1]) {
            voices = 2;
            noteU = notesList[0];
            noteL = notesList[1];
        }
        else if (draw[0] && draw[2]) {
            voices = 2;
            noteU = notesList[0];
            noteL = notesList[2];
        }
        else if (draw[1] && draw[2]) {
            voices = 2;
            noteU = notesList[1];
            noteL = notesList[2];
        }
        else {
            return true;
        }
        if (voices === 2 && noteU.stemDirection === -1 && noteL.stemDirection === 1) {
            noteU = notesList[1];
            noteL = notesList[0];
        }
        const voiceXShift = Math.max(noteU.voice_shift, noteL.voice_shift);
        let xShift = 0;
        if (voices === 2) {
            const lineSpacing = noteU.note.hasStem() && noteL.note.hasStem() && noteU.stemDirection === noteL.stemDirection ? 0.0 : 0.5;
            if (noteL.isrest && noteU.isrest && noteU.note.duration === noteL.note.duration) {
                noteL.note.render_options.draw = false;
            }
            else if (noteU.minLine <= noteL.maxLine + lineSpacing) {
                if (noteU.isrest) {
                    shiftRestVertical(noteU, noteL, 1);
                }
                else if (noteL.isrest) {
                    shiftRestVertical(noteL, noteU, -1);
                }
                else {
                    const lineDiff = Math.abs(noteU.line - noteL.line);
                    if (noteU.note.hasStem() && noteL.note.hasStem()) {
                        const noteUHead = Tables.codeNoteHead((_a = noteU.note.sortedKeyProps[0].keyProps.code) !== null && _a !== void 0 ? _a : 'N', noteU.note.duration);
                        const noteLHead = Tables.codeNoteHead((_b = noteL.note.sortedKeyProps[noteL.note.sortedKeyProps.length - 1].keyProps.code) !== null && _b !== void 0 ? _b : 'N', noteL.note.duration);
                        if (!Tables.UNISON ||
                            noteUHead !== noteLHead ||
                            noteU.note.getModifiers().filter((item) => item.getCategory() === "Dot" && item.getIndex() === 0)
                                .length !==
                                noteL.note.getModifiers().filter((item) => item.getCategory() === "Dot" && item.getIndex() === 0)
                                    .length ||
                            (lineDiff < 1 && lineDiff > 0) ||
                            JSON.stringify(noteU.note.getStyle()) !== JSON.stringify(noteL.note.getStyle())) {
                            xShift = voiceXShift + 2;
                            if (noteU.stemDirection === noteL.stemDirection) {
                                noteU.note.setXShift(xShift);
                            }
                            else {
                                noteL.note.setXShift(xShift);
                            }
                        }
                        else if (noteU.note.voice !== noteL.note.voice) {
                            if (noteU.stemDirection === noteL.stemDirection) {
                                if (noteU.line != noteL.line) {
                                    xShift = voiceXShift + 2;
                                    noteU.note.setXShift(xShift);
                                }
                                else {
                                    if (noteL.stemDirection === 1) {
                                        noteL.stemDirection = -1;
                                        noteL.note.setStemDirection(-1);
                                    }
                                }
                            }
                        }
                    }
                    else if (lineDiff < 1) {
                        xShift = voiceXShift + 2;
                        if (noteU.note.duration < noteL.note.duration) {
                            noteU.note.setXShift(xShift);
                        }
                        else {
                            noteL.note.setXShift(xShift);
                        }
                    }
                    else if (noteU.note.hasStem()) {
                        noteU.stemDirection = -noteU.note.getStemDirection();
                        noteU.note.setStemDirection(noteU.stemDirection);
                    }
                    else if (noteL.note.hasStem()) {
                        noteL.stemDirection = -noteL.note.getStemDirection();
                        noteL.note.setStemDirection(noteL.stemDirection);
                    }
                }
            }
            state.right_shift += xShift;
            return true;
        }
        if (!noteM)
            throw new RuntimeError('InvalidState', 'noteM not defined.');
        if (noteM.isrest && !noteU.isrest && !noteL.isrest) {
            if (noteU.minLine <= noteM.maxLine || noteM.minLine <= noteL.maxLine) {
                const restHeight = noteM.maxLine - noteM.minLine;
                const space = noteU.minLine - noteL.maxLine;
                if (restHeight < space) {
                    centerRest(noteM, noteU, noteL);
                }
                else {
                    xShift = voiceXShift + 2;
                    noteM.note.setXShift(xShift);
                    if (noteL.note.hasBeam() === false) {
                        noteL.stemDirection = -1;
                        noteL.note.setStemDirection(-1);
                    }
                    if (noteU.minLine <= noteL.maxLine && noteU.note.hasBeam() === false) {
                        noteU.stemDirection = 1;
                        noteU.note.setStemDirection(1);
                    }
                }
                state.right_shift += xShift;
                return true;
            }
        }
        if (noteU.isrest && noteM.isrest && noteL.isrest) {
            noteU.note.render_options.draw = false;
            noteL.note.render_options.draw = false;
            state.right_shift += xShift;
            return true;
        }
        if (noteM.isrest && noteU.isrest && noteM.minLine <= noteL.maxLine) {
            noteM.note.render_options.draw = false;
        }
        if (noteM.isrest && noteL.isrest && noteU.minLine <= noteM.maxLine) {
            noteM.note.render_options.draw = false;
        }
        if (noteU.isrest && noteU.minLine <= noteM.maxLine) {
            shiftRestVertical(noteU, noteM, 1);
        }
        if (noteL.isrest && noteM.minLine <= noteL.maxLine) {
            shiftRestVertical(noteL, noteM, -1);
        }
        if (noteU.minLine <= noteM.maxLine + 0.5 || noteM.minLine <= noteL.maxLine) {
            xShift = voiceXShift + 2;
            noteM.note.setXShift(xShift);
            if (noteL.note.hasBeam() === false) {
                noteL.stemDirection = -1;
                noteL.note.setStemDirection(-1);
            }
            if (noteU.minLine <= noteL.maxLine && noteU.note.hasBeam() === false) {
                noteU.stemDirection = 1;
                noteU.note.setStemDirection(1);
            }
        }
        state.right_shift += xShift;
        return true;
    }
    static postFormat(notes) {
        if (!notes)
            return false;
        notes.forEach((note) => note.postFormat());
        return true;
    }
    constructor(noteStruct) {
        var _a, _b, _c;
        super(noteStruct);
        this.minLine = 0;
        this.maxLine = 0;
        this.sortedKeyProps = [];
        this.ledgerLineStyle = {};
        this.clef = (_a = noteStruct.clef) !== null && _a !== void 0 ? _a : 'treble';
        this.octave_shift = (_b = noteStruct.octave_shift) !== null && _b !== void 0 ? _b : 0;
        this.glyphProps = Tables.getGlyphProps(this.duration, this.noteType);
        defined(this.glyphProps, 'BadArguments', `No glyph found for duration '${this.duration}' and type '${this.noteType}'`);
        this.displaced = false;
        this.dot_shiftY = 0;
        this.use_default_head_x = false;
        this._noteHeads = [];
        this.modifiers = [];
        this.render_options = Object.assign(Object.assign({}, this.render_options), { glyph_font_scale: noteStruct.glyph_font_scale || Tables.NOTATION_FONT_SCALE, stroke_px: noteStruct.stroke_px || StaveNote.LEDGER_LINE_OFFSET });
        this.calculateKeyProps();
        this.buildStem();
        if (noteStruct.auto_stem) {
            this.autoStem();
        }
        else {
            this.setStemDirection((_c = noteStruct.stem_direction) !== null && _c !== void 0 ? _c : Stem.UP);
        }
        this.reset();
        this.buildFlag();
    }
    reset() {
        super.reset();
        const noteHeadStyles = this._noteHeads.map((noteHead) => noteHead.getStyle());
        this.buildNoteHeads();
        this._noteHeads.forEach((noteHead, index) => {
            const noteHeadStyle = noteHeadStyles[index];
            if (noteHeadStyle)
                noteHead.setStyle(noteHeadStyle);
        });
        const stave = this.stave;
        if (stave) {
            this.setStave(stave);
        }
        this.calcNoteDisplacements();
        return this;
    }
    setBeam(beam) {
        this.beam = beam;
        this.calcNoteDisplacements();
        if (this.stem) {
            this.stem.setExtension(this.getStemExtension());
        }
        return this;
    }
    buildStem() {
        this.setStem(new Stem({ hide: !!this.isRest() }));
        return this;
    }
    buildNoteHeads() {
        this._noteHeads = [];
        const stemDirection = this.getStemDirection();
        const keys = this.getKeys();
        let lastLine = undefined;
        let lineDiff = undefined;
        let displaced = false;
        let start;
        let end;
        let step;
        if (stemDirection === Stem.UP) {
            start = 0;
            end = keys.length;
            step = 1;
        }
        else {
            start = keys.length - 1;
            end = -1;
            step = -1;
        }
        for (let i = start; i !== end; i += step) {
            const noteProps = this.sortedKeyProps[i].keyProps;
            const line = noteProps.line;
            if (lastLine === undefined) {
                lastLine = line;
            }
            else {
                lineDiff = Math.abs(lastLine - line);
                if (lineDiff === 0 || lineDiff === 0.5) {
                    displaced = !displaced;
                }
                else {
                    displaced = false;
                    this.use_default_head_x = true;
                }
            }
            lastLine = line;
            const notehead = new NoteHead({
                duration: this.duration,
                note_type: this.noteType,
                displaced,
                stem_direction: stemDirection,
                custom_glyph_code: noteProps.code,
                glyph_font_scale: this.render_options.glyph_font_scale,
                x_shift: noteProps.shift_right,
                stem_up_x_offset: noteProps.stem_up_x_offset,
                stem_down_x_offset: noteProps.stem_down_x_offset,
                line: noteProps.line,
            });
            this.addChildElement(notehead);
            this._noteHeads[this.sortedKeyProps[i].index] = notehead;
        }
        return this._noteHeads;
    }
    autoStem() {
        this.setStemDirection(this.calculateOptimalStemDirection());
    }
    calculateOptimalStemDirection() {
        this.minLine = this.sortedKeyProps[0].keyProps.line;
        this.maxLine = this.sortedKeyProps[this.keyProps.length - 1].keyProps.line;
        const MIDDLE_LINE = 3;
        const decider = (this.minLine + this.maxLine) / 2;
        const stemDirection = decider < MIDDLE_LINE ? Stem.UP : Stem.DOWN;
        return stemDirection;
    }
    calculateKeyProps() {
        let lastLine;
        for (let i = 0; i < this.keys.length; ++i) {
            const key = this.keys[i];
            if (this.glyphProps.rest)
                this.glyphProps.position = key;
            const options = { octave_shift: this.octave_shift || 0, duration: this.duration };
            const props = Tables.keyProperties(key, this.clef, options);
            if (!props) {
                throw new RuntimeError('BadArguments', `Invalid key for note properties: ${key}`);
            }
            if (props.key === 'R') {
                if (this.duration === '1' || this.duration === 'w') {
                    props.line = 4;
                }
                else {
                    props.line = 3;
                }
            }
            const line = props.line;
            if (lastLine == undefined) {
                lastLine = line;
            }
            else {
                if (Math.abs(lastLine - line) === 0.5) {
                    this.displaced = true;
                    props.displaced = true;
                    if (this.keyProps.length > 0) {
                        this.keyProps[i - 1].displaced = true;
                    }
                }
            }
            lastLine = line;
            this.keyProps.push(props);
        }
        this.keyProps.forEach((keyProps, index) => {
            this.sortedKeyProps.push({ keyProps, index });
        });
        this.sortedKeyProps.sort((a, b) => a.keyProps.line - b.keyProps.line);
    }
    getBoundingBox() {
        var _a, _b;
        if (!this.preFormatted) {
            throw new RuntimeError('UnformattedNote', "Can't call getBoundingBox on an unformatted note.");
        }
        const { width: w, modLeftPx, leftDisplacedHeadPx } = this.getMetrics();
        const x = this.getAbsoluteX() - modLeftPx - leftDisplacedHeadPx;
        let minY = 0;
        let maxY = 0;
        const halfLineSpacing = ((_b = (_a = this.getStave()) === null || _a === void 0 ? void 0 : _a.getSpacingBetweenLines()) !== null && _b !== void 0 ? _b : 0) / 2;
        const lineSpacing = halfLineSpacing * 2;
        if (this.isRest()) {
            const y = this.ys[0];
            const frac = Tables.durationToFraction(this.duration);
            if (frac.equals(1) || frac.equals(2)) {
                minY = y - halfLineSpacing;
                maxY = y + halfLineSpacing;
            }
            else {
                minY = y - this.glyphProps.line_above * lineSpacing;
                maxY = y + this.glyphProps.line_below * lineSpacing;
            }
        }
        else if (this.glyphProps.stem) {
            const ys = this.getStemExtents();
            ys.baseY += halfLineSpacing * this.getStemDirection();
            minY = Math.min(ys.topY, ys.baseY);
            maxY = Math.max(ys.topY, ys.baseY);
        }
        else {
            minY = 0;
            maxY = 0;
            for (let i = 0; i < this.ys.length; ++i) {
                const yy = this.ys[i];
                if (i === 0) {
                    minY = yy;
                    maxY = yy;
                }
                else {
                    minY = Math.min(yy, minY);
                    maxY = Math.max(yy, maxY);
                }
            }
            minY -= halfLineSpacing;
            maxY += halfLineSpacing;
        }
        return new BoundingBox(x, minY, w, maxY - minY);
    }
    getLineNumber(isTopNote) {
        if (!this.keyProps.length) {
            throw new RuntimeError('NoKeyProps', "Can't get bottom note line, because note is not initialized properly.");
        }
        let resultLine = this.keyProps[0].line;
        for (let i = 0; i < this.keyProps.length; i++) {
            const thisLine = this.keyProps[i].line;
            if (isTopNote) {
                if (thisLine > resultLine)
                    resultLine = thisLine;
            }
            else {
                if (thisLine < resultLine)
                    resultLine = thisLine;
            }
        }
        return resultLine;
    }
    isRest() {
        return this.glyphProps.rest;
    }
    isChord() {
        return !this.isRest() && this.keys.length > 1;
    }
    hasStem() {
        return this.glyphProps.stem;
    }
    hasFlag() {
        return super.hasFlag() && !this.isRest();
    }
    getStemX() {
        if (this.noteType === 'r') {
            return this.getCenterGlyphX();
        }
        else {
            return super.getStemX() + (this.stem_direction ? Stem.WIDTH / (2 * -this.stem_direction) : 0);
        }
    }
    getYForTopText(textLine) {
        const extents = this.getStemExtents();
        return Math.min(this.checkStave().getYForTopText(textLine), extents.topY - this.render_options.annotation_spacing * (textLine + 1));
    }
    getYForBottomText(textLine) {
        const extents = this.getStemExtents();
        return Math.max(this.checkStave().getYForTopText(textLine), extents.baseY + this.render_options.annotation_spacing * textLine);
    }
    setStave(stave) {
        super.setStave(stave);
        const ys = this._noteHeads.map((notehead) => {
            notehead.setStave(stave);
            return notehead.getY();
        });
        this.setYs(ys);
        if (this.stem) {
            const { y_top, y_bottom } = this.getNoteHeadBounds();
            this.stem.setYBounds(y_top, y_bottom);
        }
        return this;
    }
    isDisplaced() {
        return this.displaced;
    }
    setNoteDisplaced(displaced) {
        this.displaced = displaced;
        return this;
    }
    getTieRightX() {
        let tieStartX = this.getAbsoluteX();
        tieStartX += this.getGlyphWidth() + this.x_shift + this.rightDisplacedHeadPx;
        if (this.modifierContext)
            tieStartX += this.modifierContext.getRightShift();
        return tieStartX;
    }
    getTieLeftX() {
        let tieEndX = this.getAbsoluteX();
        tieEndX += this.x_shift - this.leftDisplacedHeadPx;
        return tieEndX;
    }
    getLineForRest() {
        let restLine = this.keyProps[0].line;
        if (this.keyProps.length > 1) {
            const lastLine = this.keyProps[this.keyProps.length - 1].line;
            const top = Math.max(restLine, lastLine);
            const bot = Math.min(restLine, lastLine);
            restLine = midLine(top, bot);
        }
        return restLine;
    }
    getModifierStartXY(position, index, options = {}) {
        var _a, _b;
        if (!this.preFormatted) {
            throw new RuntimeError('UnformattedNote', "Can't call GetModifierStartXY on an unformatted note");
        }
        if (this.ys.length === 0) {
            throw new RuntimeError('NoYValues', 'No Y-Values calculated for this note.');
        }
        const { ABOVE, BELOW, LEFT, RIGHT } = Modifier.Position;
        let x = 0;
        if (position === LEFT) {
            x = -1 * 2;
        }
        else if (position === RIGHT) {
            x = this.getGlyphWidth() + this.x_shift + 2;
            if (this.stem_direction === Stem.UP &&
                this.hasFlag() &&
                (options.forceFlagRight || isInnerNoteIndex(this, index))) {
                x += (_b = (_a = this === null || this === void 0 ? void 0 : this.flag) === null || _a === void 0 ? void 0 : _a.getMetrics().width) !== null && _b !== void 0 ? _b : 0;
            }
        }
        else if (position === BELOW || position === ABOVE) {
            x = this.getGlyphWidth() / 2;
        }
        return {
            x: this.getAbsoluteX() + x,
            y: this.ys[index],
        };
    }
    setStyle(style) {
        return super.setGroupStyle(style);
    }
    setStemStyle(style) {
        const stem = this.getStem();
        if (stem)
            stem.setStyle(style);
        return this;
    }
    getStemStyle() {
        var _a;
        return (_a = this.stem) === null || _a === void 0 ? void 0 : _a.getStyle();
    }
    setLedgerLineStyle(style) {
        this.ledgerLineStyle = style;
    }
    getLedgerLineStyle() {
        return this.ledgerLineStyle;
    }
    setFlagStyle(style) {
        var _a;
        (_a = this.flag) === null || _a === void 0 ? void 0 : _a.setStyle(style);
    }
    getFlagStyle() {
        var _a;
        return (_a = this.flag) === null || _a === void 0 ? void 0 : _a.getStyle();
    }
    setKeyStyle(index, style) {
        this._noteHeads[index].setStyle(style);
        return this;
    }
    setKeyLine(index, line) {
        this.keyProps[index].line = line;
        this.reset();
        return this;
    }
    getKeyLine(index) {
        return this.keyProps[index].line;
    }
    getVoiceShiftWidth() {
        return this.getGlyphWidth() * (this.displaced ? 2 : 1);
    }
    calcNoteDisplacements() {
        this.setLeftDisplacedHeadPx(this.displaced && this.stem_direction === Stem.DOWN ? this.getGlyphWidth() : 0);
        this.setRightDisplacedHeadPx(!this.hasFlag() && this.displaced && this.stem_direction === Stem.UP ? this.getGlyphWidth() : 0);
    }
    preFormat() {
        if (this.preFormatted)
            return;
        let noteHeadPadding = 0;
        if (this.modifierContext) {
            this.modifierContext.preFormat();
            if (this.modifierContext.getWidth() === 0) {
                noteHeadPadding = StaveNote.minNoteheadPadding;
            }
        }
        let width = this.getGlyphWidth() + this.leftDisplacedHeadPx + this.rightDisplacedHeadPx + noteHeadPadding;
        if (this.shouldDrawFlag() && this.stem_direction === Stem.UP) {
            width += this.getGlyphWidth();
        }
        this.setWidth(width);
        this.preFormatted = true;
    }
    getNoteHeadBounds() {
        let yTop = +Infinity;
        let yBottom = -Infinity;
        let nonDisplacedX;
        let displacedX;
        let highestLine = this.checkStave().getNumLines();
        let lowestLine = 1;
        let highestDisplacedLine;
        let lowestDisplacedLine;
        let highestNonDisplacedLine = highestLine;
        let lowestNonDisplacedLine = lowestLine;
        this._noteHeads.forEach((notehead) => {
            const line = notehead.getLine();
            const y = notehead.getY();
            yTop = Math.min(y, yTop);
            yBottom = Math.max(y, yBottom);
            if (displacedX === undefined && notehead.isDisplaced()) {
                displacedX = notehead.getAbsoluteX();
            }
            if (nonDisplacedX === undefined && !notehead.isDisplaced()) {
                nonDisplacedX = notehead.getAbsoluteX();
            }
            highestLine = Math.max(line, highestLine);
            lowestLine = Math.min(line, lowestLine);
            if (notehead.isDisplaced()) {
                highestDisplacedLine = highestDisplacedLine === undefined ? line : Math.max(line, highestDisplacedLine);
                lowestDisplacedLine = lowestDisplacedLine === undefined ? line : Math.min(line, lowestDisplacedLine);
            }
            else {
                highestNonDisplacedLine = Math.max(line, highestNonDisplacedLine);
                lowestNonDisplacedLine = Math.min(line, lowestNonDisplacedLine);
            }
        }, this);
        return {
            y_top: yTop,
            y_bottom: yBottom,
            displaced_x: displacedX,
            non_displaced_x: nonDisplacedX,
            highest_line: highestLine,
            lowest_line: lowestLine,
            highest_displaced_line: highestDisplacedLine,
            lowest_displaced_line: lowestDisplacedLine,
            highest_non_displaced_line: highestNonDisplacedLine,
            lowest_non_displaced_line: lowestNonDisplacedLine,
        };
    }
    getNoteHeadBeginX() {
        return this.getAbsoluteX() + this.x_shift;
    }
    getNoteHeadEndX() {
        const xBegin = this.getNoteHeadBeginX();
        return xBegin + this.getGlyphWidth();
    }
    get noteHeads() {
        return this._noteHeads.slice();
    }
    get note_heads() {
        showDeprecationWarningForNoteHeads();
        return this.noteHeads;
    }
    drawLedgerLines() {
        const stave = this.checkStave();
        const { glyphProps, render_options: { stroke_px }, } = this;
        const ctx = this.checkContext();
        const width = glyphProps.getWidth() + stroke_px * 2;
        const doubleWidth = 2 * (glyphProps.getWidth() + stroke_px) - Stem.WIDTH / 2;
        if (this.isRest())
            return;
        if (!ctx) {
            throw new RuntimeError('NoCanvasContext', "Can't draw without a canvas context.");
        }
        const { highest_line, lowest_line, highest_displaced_line, highest_non_displaced_line, lowest_displaced_line, lowest_non_displaced_line, displaced_x, non_displaced_x, } = this.getNoteHeadBounds();
        if (highest_line < 6 && lowest_line > 0)
            return;
        const min_x = Math.min(displaced_x !== null && displaced_x !== void 0 ? displaced_x : 0, non_displaced_x !== null && non_displaced_x !== void 0 ? non_displaced_x : 0);
        const drawLedgerLine = (y, normal, displaced) => {
            let x;
            if (displaced && normal)
                x = min_x - stroke_px;
            else if (normal)
                x = (non_displaced_x !== null && non_displaced_x !== void 0 ? non_displaced_x : 0) - stroke_px;
            else
                x = (displaced_x !== null && displaced_x !== void 0 ? displaced_x : 0) - stroke_px;
            const ledgerWidth = normal && displaced ? doubleWidth : width;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + ledgerWidth, y);
            ctx.stroke();
        };
        const style = Object.assign(Object.assign({}, stave.getDefaultLedgerLineStyle()), this.getLedgerLineStyle());
        this.applyStyle(ctx, style);
        for (let line = 6; line <= highest_line; ++line) {
            const normal = non_displaced_x !== undefined && line <= highest_non_displaced_line;
            const displaced = highest_displaced_line !== undefined && line <= highest_displaced_line;
            drawLedgerLine(stave.getYForNote(line), normal, displaced);
        }
        for (let line = 0; line >= lowest_line; --line) {
            const normal = non_displaced_x !== undefined && line >= lowest_non_displaced_line;
            const displaced = lowest_displaced_line !== undefined && line >= lowest_displaced_line;
            drawLedgerLine(stave.getYForNote(line), normal, displaced);
        }
        this.restoreStyle(ctx, style);
    }
    drawModifiers(noteheadParam) {
        const ctx = this.checkContext();
        for (let i = 0; i < this.modifiers.length; i++) {
            const modifier = this.modifiers[i];
            const index = modifier.checkIndex();
            const notehead = this._noteHeads[index];
            if (notehead == noteheadParam) {
                const noteheadStyle = notehead.getStyle();
                notehead.applyStyle(ctx, noteheadStyle);
                modifier.setContext(ctx);
                modifier.drawWithStyle();
                notehead.restoreStyle(ctx, noteheadStyle);
            }
        }
    }
    shouldDrawFlag() {
        const hasStem = this.stem !== undefined;
        const hasFlag = this.glyphProps.flag == true;
        const hasNoBeam = this.beam === undefined;
        return hasStem && hasFlag && hasNoBeam;
    }
    drawFlag() {
        var _a, _b, _c, _d, _e;
        const ctx = this.checkContext();
        if (!ctx) {
            throw new RuntimeError('NoCanvasContext', "Can't draw without a canvas context.");
        }
        if (this.shouldDrawFlag()) {
            const { y_top, y_bottom } = this.getNoteHeadBounds();
            const noteStemHeight = this.stem.getHeight();
            const flagX = this.getStemX();
            const flagY = this.getStemDirection() === Stem.DOWN
                ?
                    y_top -
                        noteStemHeight +
                        2 -
                        (this.glyphProps ? this.glyphProps.stem_down_extension : 0) * this.getStaveNoteScale() -
                        ((_b = (_a = this.flag) === null || _a === void 0 ? void 0 : _a.getMetrics().y_shift) !== null && _b !== void 0 ? _b : 0) * (1 - this.getStaveNoteScale())
                :
                    y_bottom -
                        noteStemHeight -
                        2 +
                        (this.glyphProps ? this.glyphProps.stem_up_extension : 0) * this.getStaveNoteScale() -
                        ((_d = (_c = this.flag) === null || _c === void 0 ? void 0 : _c.getMetrics().y_shift) !== null && _d !== void 0 ? _d : 0) * (1 - this.getStaveNoteScale());
            (_e = this.flag) === null || _e === void 0 ? void 0 : _e.render(ctx, flagX, flagY);
        }
    }
    drawNoteHeads() {
        const ctx = this.checkContext();
        this._noteHeads.forEach((notehead) => {
            notehead.applyStyle(ctx);
            ctx.openGroup('notehead', notehead.getAttribute('id'), { pointerBBox: true });
            notehead.setContext(ctx).draw();
            this.drawModifiers(notehead);
            ctx.closeGroup();
            notehead.restoreStyle(ctx);
        });
    }
    drawStem(stemOptions) {
        const ctx = this.checkContext();
        if (stemOptions) {
            this.setStem(new Stem(stemOptions));
        }
        if (this.shouldDrawFlag() && this.stem) {
            this.stem.adjustHeightForFlag();
        }
        if (this.stem) {
            this.stem.setContext(ctx).draw();
        }
    }
    getStaveNoteScale() {
        return 1.0;
    }
    getStemExtension() {
        const super_stem_extension = super.getStemExtension();
        if (!this.glyphProps.stem) {
            return super_stem_extension;
        }
        const stem_direction = this.getStemDirection();
        if (stem_direction !== this.calculateOptimalStemDirection()) {
            return super_stem_extension;
        }
        let mid_line_distance;
        const MIDDLE_LINE = 3;
        if (stem_direction === Stem.UP) {
            mid_line_distance = MIDDLE_LINE - this.maxLine;
        }
        else {
            mid_line_distance = this.minLine - MIDDLE_LINE;
        }
        const lines_over_octave_from_mid_line = mid_line_distance - 3.5;
        if (lines_over_octave_from_mid_line <= 0) {
            return super_stem_extension;
        }
        const stave = this.getStave();
        let spacing_between_lines = 10;
        if (stave != undefined) {
            spacing_between_lines = stave.getSpacingBetweenLines();
        }
        return super_stem_extension + lines_over_octave_from_mid_line * spacing_between_lines;
    }
    draw() {
        if (this.render_options.draw === false)
            return;
        if (this.ys.length === 0) {
            throw new RuntimeError('NoYValues', "Can't draw note without Y values.");
        }
        const ctx = this.checkContext();
        const xBegin = this.getNoteHeadBeginX();
        const shouldRenderStem = this.hasStem() && !this.beam;
        this._noteHeads.forEach((notehead) => notehead.setX(xBegin));
        if (this.stem) {
            const stemX = this.getStemX();
            this.stem.setNoteHeadXBounds(stemX, stemX);
        }
        L('Rendering ', this.isChord() ? 'chord :' : 'note :', this.keys);
        this.applyStyle();
        ctx.openGroup('stavenote', this.getAttribute('id'));
        this.drawLedgerLines();
        if (shouldRenderStem)
            this.drawStem();
        this.drawNoteHeads();
        this.drawFlag();
        ctx.closeGroup();
        this.restoreStyle();
        this.setRendered();
    }
}
StaveNote.DEBUG = false;
export { StaveNote };
