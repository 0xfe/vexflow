import { Glyph } from './glyph.js';
import { Modifier } from './modifier.js';
import { Stem } from './stem.js';
import { Tables } from './tables.js';
import { isGraceNote, isStaveNote, isStemmableNote, isTabNote } from './typeguard.js';
import { defined, log, RuntimeError } from './util.js';
function L(...args) {
    if (Articulation.DEBUG)
        log('Vex.Flow.Articulation', args);
}
const { ABOVE, BELOW } = Modifier.Position;
function roundToNearestHalf(mathFn, value) {
    return mathFn(value / 0.5) * 0.5;
}
function isWithinLines(line, position) {
    return position === ABOVE ? line <= 5 : line >= 1;
}
function getRoundingFunction(line, position) {
    if (isWithinLines(line, position)) {
        if (position === ABOVE) {
            return Math.ceil;
        }
        else {
            return Math.floor;
        }
    }
    else {
        return Math.round;
    }
}
function snapLineToStaff(canSitBetweenLines, line, position, offsetDirection) {
    const snappedLine = roundToNearestHalf(getRoundingFunction(line, position), line);
    const canSnapToStaffSpace = canSitBetweenLines && isWithinLines(snappedLine, position);
    const onStaffLine = snappedLine % 1 === 0;
    if (canSnapToStaffSpace && onStaffLine) {
        const HALF_STAFF_SPACE = 0.5;
        return snappedLine + HALF_STAFF_SPACE * -offsetDirection;
    }
    else {
        return snappedLine;
    }
}
const isStaveOrGraceNote = (note) => isStaveNote(note) || isGraceNote(note);
function getTopY(note, textLine) {
    const stemDirection = note.getStemDirection();
    const { topY: stemTipY, baseY: stemBaseY } = note.getStemExtents();
    if (isStaveOrGraceNote(note)) {
        if (note.hasStem()) {
            if (stemDirection === Stem.UP) {
                return stemTipY;
            }
            else {
                return stemBaseY;
            }
        }
        else {
            return Math.min(...note.getYs());
        }
    }
    else if (isTabNote(note)) {
        if (note.hasStem()) {
            if (stemDirection === Stem.UP) {
                return stemTipY;
            }
            else {
                return note.checkStave().getYForTopText(textLine);
            }
        }
        else {
            return note.checkStave().getYForTopText(textLine);
        }
    }
    else {
        throw new RuntimeError('UnknownCategory', 'Only can get the top and bottom ys of stavenotes and tabnotes');
    }
}
function getBottomY(note, textLine) {
    const stemDirection = note.getStemDirection();
    const { topY: stemTipY, baseY: stemBaseY } = note.getStemExtents();
    if (isStaveOrGraceNote(note)) {
        if (note.hasStem()) {
            if (stemDirection === Stem.UP) {
                return stemBaseY;
            }
            else {
                return stemTipY;
            }
        }
        else {
            return Math.max(...note.getYs());
        }
    }
    else if (isTabNote(note)) {
        if (note.hasStem()) {
            if (stemDirection === Stem.UP) {
                return note.checkStave().getYForBottomText(textLine);
            }
            else {
                return stemTipY;
            }
        }
        else {
            return note.checkStave().getYForBottomText(textLine);
        }
    }
    else {
        throw new RuntimeError('UnknownCategory', 'Only can get the top and bottom ys of stavenotes and tabnotes');
    }
}
function getInitialOffset(note, position) {
    const isOnStemTip = (position === ABOVE && note.getStemDirection() === Stem.UP) ||
        (position === BELOW && note.getStemDirection() === Stem.DOWN);
    if (isStaveOrGraceNote(note)) {
        if (note.hasStem() && isOnStemTip) {
            return 0.5;
        }
        else {
            return 1;
        }
    }
    else {
        if (note.hasStem() && isOnStemTip) {
            return 1;
        }
        else {
            return 0;
        }
    }
}
class Articulation extends Modifier {
    static get CATEGORY() {
        return "Articulation";
    }
    static format(articulations, state) {
        if (!articulations || articulations.length === 0)
            return false;
        const margin = 0.5;
        let maxGlyphWidth = 0;
        const getIncrement = (articulation, line, position) => roundToNearestHalf(getRoundingFunction(line, position), defined(articulation.glyph.getMetrics().height) / 10 + margin);
        articulations.forEach((articulation) => {
            const note = articulation.checkAttachedNote();
            maxGlyphWidth = Math.max(note.getGlyphProps().getWidth(), maxGlyphWidth);
            let lines = 5;
            const stemDirection = note.hasStem() ? note.getStemDirection() : Stem.UP;
            let stemHeight = 0;
            if (isStemmableNote(note)) {
                const stem = note.getStem();
                if (stem) {
                    stemHeight = Math.abs(stem.getHeight()) / Tables.STAVE_LINE_DISTANCE;
                }
            }
            const stave = note.getStave();
            if (stave) {
                lines = stave.getNumLines();
            }
            if (articulation.getPosition() === ABOVE) {
                let noteLine = note.getLineNumber(true);
                if (stemDirection === Stem.UP) {
                    noteLine += stemHeight;
                }
                let increment = getIncrement(articulation, state.top_text_line, ABOVE);
                const curTop = noteLine + state.top_text_line + 0.5;
                if (!articulation.articulation.between_lines && curTop < lines) {
                    increment += lines - curTop;
                }
                articulation.setTextLine(state.top_text_line);
                state.top_text_line += increment;
            }
            else if (articulation.getPosition() === BELOW) {
                let noteLine = Math.max(lines - note.getLineNumber(), 0);
                if (stemDirection === Stem.DOWN) {
                    noteLine += stemHeight;
                }
                let increment = getIncrement(articulation, state.text_line, BELOW);
                const curBottom = noteLine + state.text_line + 0.5;
                if (!articulation.articulation.between_lines && curBottom < lines) {
                    increment += lines - curBottom;
                }
                articulation.setTextLine(state.text_line);
                state.text_line += increment;
            }
        });
        const width = articulations
            .map((articulation) => articulation.getWidth())
            .reduce((maxWidth, articWidth) => Math.max(articWidth, maxWidth));
        const overlap = Math.min(Math.max(width - maxGlyphWidth, 0), Math.max(width - (state.left_shift + state.right_shift), 0));
        state.left_shift += overlap / 2;
        state.right_shift += overlap / 2;
        return true;
    }
    static easyScoreHook({ articulations }, note, builder) {
        if (!articulations)
            return;
        const articNameToCode = {
            staccato: 'a.',
            tenuto: 'a-',
            accent: 'a>',
        };
        articulations
            .split(',')
            .map((articString) => articString.trim().split('.'))
            .map(([name, position]) => {
            const artic = { type: articNameToCode[name] };
            if (position)
                artic.position = Modifier.PositionString[position];
            return builder.getFactory().Articulation(artic);
        })
            .map((artic) => note.addModifier(artic, 0));
    }
    constructor(type) {
        super();
        this.type = type;
        this.position = ABOVE;
        this.render_options = {
            font_scale: Tables.NOTATION_FONT_SCALE,
        };
        this.reset();
    }
    reset() {
        this.articulation = Tables.articulationCodes(this.type);
        if (!this.articulation) {
            this.articulation = { code: this.type, between_lines: false };
            if (this.type.endsWith('Above'))
                this.position = ABOVE;
            if (this.type.endsWith('Below'))
                this.position = BELOW;
        }
        const code = (this.position === ABOVE ? this.articulation.aboveCode : this.articulation.belowCode) || this.articulation.code;
        this.glyph = new Glyph(code !== null && code !== void 0 ? code : '', this.render_options.font_scale);
        defined(this.glyph, 'ArgumentError', `Articulation not found: ${this.type}`);
        this.setWidth(defined(this.glyph.getMetrics().width));
    }
    setBetweenLines(betweenLines = true) {
        this.articulation.between_lines = betweenLines;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const index = this.checkIndex();
        const { position, glyph, text_line: textLine } = this;
        const canSitBetweenLines = this.articulation.between_lines;
        const stave = note.checkStave();
        const staffSpace = stave.getSpacingBetweenLines();
        const isTab = isTabNote(note);
        const { x } = note.getModifierStartXY(position, index);
        const shouldSitOutsideStaff = !canSitBetweenLines || isTab;
        const initialOffset = getInitialOffset(note, position);
        const padding = Tables.currentMusicFont().lookupMetric(`articulation.${glyph.getCode()}.padding`, 0);
        let y = {
            [ABOVE]: () => {
                glyph.setOrigin(0.5, 1);
                const y = getTopY(note, textLine) - (textLine + initialOffset) * staffSpace;
                return shouldSitOutsideStaff ? Math.min(stave.getYForTopText(Articulation.INITIAL_OFFSET), y) : y;
            },
            [BELOW]: () => {
                glyph.setOrigin(0.5, 0);
                const y = getBottomY(note, textLine) + (textLine + initialOffset) * staffSpace;
                return shouldSitOutsideStaff ? Math.max(stave.getYForBottomText(Articulation.INITIAL_OFFSET), y) : y;
            },
        }[position]();
        if (!isTab) {
            const offsetDirection = position === ABOVE ? -1 : +1;
            const noteLine = note.getKeyProps()[index].line;
            const distanceFromNote = (note.getYs()[index] - y) / staffSpace;
            const articLine = distanceFromNote + Number(noteLine);
            const snappedLine = snapLineToStaff(canSitBetweenLines, articLine, position, offsetDirection);
            if (isWithinLines(snappedLine, position))
                glyph.setOrigin(0.5, 0.5);
            y += Math.abs(snappedLine - articLine) * staffSpace * offsetDirection + padding * offsetDirection;
        }
        L(`Rendering articulation at (x: ${x}, y: ${y})`);
        glyph.render(ctx, x, y);
    }
}
Articulation.DEBUG = false;
Articulation.INITIAL_OFFSET = -0.5;
export { Articulation };
