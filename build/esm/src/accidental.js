import { Fraction } from './fraction.js';
import { Glyph } from './glyph.js';
import { Modifier } from './modifier.js';
import { Music } from './music.js';
import { Tables } from './tables.js';
import { isAccidental, isGraceNote, isGraceNoteGroup, isStaveNote } from './typeguard.js';
import { defined, log } from './util.js';
function L(...args) {
    if (Accidental.DEBUG)
        log('Vex.Flow.Accidental', args);
}
export class Accidental extends Modifier {
    constructor(type) {
        super();
        L('New accidental: ', type);
        this.type = type;
        this.position = Modifier.Position.LEFT;
        this.render_options = {
            font_scale: 38,
            parenLeftPadding: 2,
            parenRightPadding: 2,
        };
        this.accidental = Tables.accidentalCodes(this.type);
        defined(this.accidental, 'ArgumentError', `Unknown accidental type: ${type}`);
        this.cautionary = false;
        this.reset();
    }
    static get CATEGORY() {
        return "Accidental";
    }
    static format(accidentals, state) {
        if (!accidentals || accidentals.length === 0)
            return;
        const musicFont = Tables.currentMusicFont();
        const noteheadAccidentalPadding = musicFont.lookupMetric('accidental.noteheadAccidentalPadding');
        const leftShift = state.left_shift + noteheadAccidentalPadding;
        const accidentalSpacing = musicFont.lookupMetric('accidental.accidentalSpacing');
        const additionalPadding = musicFont.lookupMetric('accidental.leftPadding');
        const accList = [];
        let prevNote = undefined;
        let shiftL = 0;
        for (let i = 0; i < accidentals.length; ++i) {
            const acc = accidentals[i];
            const note = acc.getNote();
            const stave = note.getStave();
            const index = acc.checkIndex();
            const props = note.getKeyProps()[index];
            if (note !== prevNote) {
                for (let n = 0; n < note.keys.length; ++n) {
                    shiftL = Math.max(note.getLeftDisplacedHeadPx() - note.getXShift(), shiftL);
                }
                prevNote = note;
            }
            if (stave) {
                const lineSpace = stave.getSpacingBetweenLines();
                const y = stave.getYForLine(props.line);
                const accLine = Math.round((y / lineSpace) * 2) / 2;
                accList.push({ y, line: accLine, shift: shiftL, acc, lineSpace });
            }
            else {
                accList.push({ line: props.line, shift: shiftL, acc });
            }
        }
        accList.sort((a, b) => b.line - a.line);
        const lineList = [];
        let accShift = 0;
        let previousLine = undefined;
        for (let i = 0; i < accList.length; i++) {
            const acc = accList[i];
            if (previousLine === undefined || previousLine !== acc.line) {
                lineList.push({
                    line: acc.line,
                    flatLine: true,
                    dblSharpLine: true,
                    numAcc: 0,
                    width: 0,
                    column: 0,
                });
            }
            if (acc.acc.type !== 'b' && acc.acc.type !== 'bb') {
                lineList[lineList.length - 1].flatLine = false;
            }
            if (acc.acc.type !== '##') {
                lineList[lineList.length - 1].dblSharpLine = false;
            }
            lineList[lineList.length - 1].numAcc++;
            lineList[lineList.length - 1].width += acc.acc.getWidth() + accidentalSpacing;
            accShift = acc.shift > accShift ? acc.shift : accShift;
            previousLine = acc.line;
        }
        let totalColumns = 0;
        for (let i = 0; i < lineList.length; i++) {
            let noFurtherConflicts = false;
            const groupStart = i;
            let groupEnd = i;
            while (groupEnd + 1 < lineList.length && !noFurtherConflicts) {
                if (this.checkCollision(lineList[groupEnd], lineList[groupEnd + 1])) {
                    groupEnd++;
                }
                else {
                    noFurtherConflicts = true;
                }
            }
            const getGroupLine = (index) => lineList[groupStart + index];
            const getGroupLines = (indexes) => indexes.map(getGroupLine);
            const lineDifference = (indexA, indexB) => {
                const [a, b] = getGroupLines([indexA, indexB]).map((item) => item.line);
                return a - b;
            };
            const notColliding = (...indexPairs) => indexPairs.map(getGroupLines).every(([line1, line2]) => !this.checkCollision(line1, line2));
            const groupLength = groupEnd - groupStart + 1;
            let endCase = this.checkCollision(lineList[groupStart], lineList[groupEnd]) ? 'a' : 'b';
            switch (groupLength) {
                case 3:
                    if (endCase === 'a' && lineDifference(1, 2) === 0.5 && lineDifference(0, 1) !== 0.5) {
                        endCase = 'second_on_bottom';
                    }
                    break;
                case 4:
                    if (notColliding([0, 2], [1, 3])) {
                        endCase = 'spaced_out_tetrachord';
                    }
                    break;
                case 5:
                    if (endCase === 'b' && notColliding([1, 3])) {
                        endCase = 'spaced_out_pentachord';
                        if (notColliding([0, 2], [2, 4])) {
                            endCase = 'very_spaced_out_pentachord';
                        }
                    }
                    break;
                case 6:
                    if (notColliding([0, 3], [1, 4], [2, 5])) {
                        endCase = 'spaced_out_hexachord';
                    }
                    if (notColliding([0, 2], [2, 4], [1, 3], [3, 5])) {
                        endCase = 'very_spaced_out_hexachord';
                    }
                    break;
                default:
                    break;
            }
            let groupMember;
            let column;
            if (groupLength >= 7) {
                let patternLength = 2;
                let collisionDetected = true;
                while (collisionDetected === true) {
                    collisionDetected = false;
                    for (let line = 0; line + patternLength < lineList.length; line++) {
                        if (this.checkCollision(lineList[line], lineList[line + patternLength])) {
                            collisionDetected = true;
                            patternLength++;
                            break;
                        }
                    }
                }
                for (groupMember = i; groupMember <= groupEnd; groupMember++) {
                    column = ((groupMember - i) % patternLength) + 1;
                    lineList[groupMember].column = column;
                    totalColumns = totalColumns > column ? totalColumns : column;
                }
            }
            else {
                for (groupMember = i; groupMember <= groupEnd; groupMember++) {
                    column = Tables.accidentalColumnsTable[groupLength][endCase][groupMember - i];
                    lineList[groupMember].column = column;
                    totalColumns = totalColumns > column ? totalColumns : column;
                }
            }
            i = groupEnd;
        }
        const columnWidths = [];
        const columnXOffsets = [];
        for (let i = 0; i <= totalColumns; i++) {
            columnWidths[i] = 0;
            columnXOffsets[i] = 0;
        }
        columnWidths[0] = accShift + leftShift;
        columnXOffsets[0] = accShift + leftShift;
        lineList.forEach((line) => {
            if (line.width > columnWidths[line.column])
                columnWidths[line.column] = line.width;
        });
        for (let i = 1; i < columnWidths.length; i++) {
            columnXOffsets[i] = columnWidths[i] + columnXOffsets[i - 1];
        }
        const totalShift = columnXOffsets[columnXOffsets.length - 1];
        let accCount = 0;
        lineList.forEach((line) => {
            let lineWidth = 0;
            const lastAccOnLine = accCount + line.numAcc;
            for (accCount; accCount < lastAccOnLine; accCount++) {
                const xShift = columnXOffsets[line.column - 1] + lineWidth;
                accList[accCount].acc.setXShift(xShift);
                lineWidth += accList[accCount].acc.getWidth() + accidentalSpacing;
                L('Line, accCount, shift: ', line.line, accCount, xShift);
            }
        });
        state.left_shift += totalShift + additionalPadding;
    }
    static checkCollision(line1, line2) {
        let clearance = line2.line - line1.line;
        let clearanceRequired = 3;
        if (clearance > 0) {
            clearanceRequired = line2.flatLine || line2.dblSharpLine ? 2.5 : 3.0;
            if (line1.dblSharpLine)
                clearance -= 0.5;
        }
        else {
            clearanceRequired = line1.flatLine || line1.dblSharpLine ? 2.5 : 3.0;
            if (line2.dblSharpLine)
                clearance -= 0.5;
        }
        const collision = Math.abs(clearance) < clearanceRequired;
        L('Line_1, Line_2, Collision: ', line1.line, line2.line, collision);
        return collision;
    }
    static applyAccidentals(voices, keySignature) {
        const tickPositions = [];
        const tickNoteMap = {};
        voices.forEach((voice) => {
            const tickPosition = new Fraction(0, 1);
            const tickable = voice.getTickables();
            tickable.forEach((t) => {
                if (t.shouldIgnoreTicks())
                    return;
                const notesAtPosition = tickNoteMap[tickPosition.value()];
                if (!notesAtPosition) {
                    tickPositions.push(tickPosition.value());
                    tickNoteMap[tickPosition.value()] = [t];
                }
                else {
                    notesAtPosition.push(t);
                }
                tickPosition.add(t.getTicks());
            });
        });
        const music = new Music();
        if (!keySignature)
            keySignature = 'C';
        const scaleMapKey = music.createScaleMap(keySignature);
        const scaleMap = {};
        tickPositions.forEach((tickPos) => {
            const tickables = tickNoteMap[tickPos];
            const modifiedPitches = [];
            const processNote = (t) => {
                if (!isStaveNote(t) || t.isRest() || t.shouldIgnoreTicks()) {
                    return;
                }
                const staveNote = t;
                staveNote.keys.forEach((keyString, keyIndex) => {
                    const key = music.getNoteParts(keyString.split('/')[0]);
                    const octave = keyString.split('/')[1];
                    const accidentalString = key.accidental || 'n';
                    const pitch = key.root + accidentalString;
                    if (!scaleMap[key.root + octave])
                        scaleMap[key.root + octave] = scaleMapKey[key.root];
                    const sameAccidental = scaleMap[key.root + octave] === pitch;
                    const previouslyModified = modifiedPitches.indexOf(keyString) > -1;
                    staveNote.getModifiers().forEach((modifier, index) => {
                        if (isAccidental(modifier) && modifier.type == accidentalString && modifier.getIndex() == keyIndex) {
                            staveNote.getModifiers().splice(index, 1);
                        }
                    });
                    if (!sameAccidental || (sameAccidental && previouslyModified)) {
                        scaleMap[key.root + octave] = pitch;
                        const accidental = new Accidental(accidentalString);
                        staveNote.addModifier(accidental, keyIndex);
                        modifiedPitches.push(keyString);
                    }
                });
                staveNote.getModifiers().forEach((modifier) => {
                    if (isGraceNoteGroup(modifier)) {
                        modifier.getGraceNotes().forEach(processNote);
                    }
                });
            };
            tickables.forEach(processNote);
        });
    }
    reset() {
        const fontScale = this.render_options.font_scale;
        this.glyph = new Glyph(this.accidental.code, fontScale);
        this.glyph.setOriginX(1.0);
        if (this.cautionary) {
            this.parenLeft = new Glyph(Tables.accidentalCodes('{').code, fontScale);
            this.parenRight = new Glyph(Tables.accidentalCodes('}').code, fontScale);
            this.parenLeft.setOriginX(1.0);
            this.parenRight.setOriginX(1.0);
        }
    }
    getWidth() {
        if (this.cautionary) {
            const parenLeft = defined(this.parenLeft);
            const parenRight = defined(this.parenRight);
            const parenWidth = parenLeft.getMetrics().width +
                parenRight.getMetrics().width +
                this.render_options.parenLeftPadding +
                this.render_options.parenRightPadding;
            return this.glyph.getMetrics().width + parenWidth;
        }
        else {
            return this.glyph.getMetrics().width;
        }
    }
    setNote(note) {
        defined(note, 'ArgumentError', `Bad note value: ${note}`);
        this.note = note;
        if (isGraceNote(note)) {
            this.render_options.font_scale = 25;
            this.reset();
        }
        return this;
    }
    setAsCautionary() {
        this.cautionary = true;
        this.render_options.font_scale = 28;
        this.reset();
        return this;
    }
    draw() {
        const { type, position, index, cautionary, x_shift, y_shift, glyph, render_options: { parenLeftPadding, parenRightPadding }, } = this;
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const start = note.getModifierStartXY(position, index);
        let accX = start.x + x_shift;
        const accY = start.y + y_shift;
        L('Rendering: ', type, accX, accY);
        if (!cautionary) {
            glyph.render(ctx, accX, accY);
        }
        else {
            const parenLeft = defined(this.parenLeft);
            const parenRight = defined(this.parenRight);
            parenRight.render(ctx, accX, accY);
            accX -= parenRight.getMetrics().width;
            accX -= parenRightPadding;
            accX -= this.accidental.parenRightPaddingAdjustment;
            glyph.render(ctx, accX, accY);
            accX -= glyph.getMetrics().width;
            accX -= parenLeftPadding;
            parenLeft.render(ctx, accX, accY);
        }
    }
}
Accidental.DEBUG = false;
