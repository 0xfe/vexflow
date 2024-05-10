import { Glyph } from './glyph.js';
import { Modifier } from './modifier.js';
import { Stem } from './stem.js';
import { Tables } from './tables.js';
import { isTabNote } from './typeguard.js';
import { defined, log, RuntimeError } from './util.js';
function L(...args) {
    if (Ornament.DEBUG)
        log('Vex.Flow.Ornament', args);
}
class Ornament extends Modifier {
    static get CATEGORY() {
        return "Ornament";
    }
    static get minPadding() {
        const musicFont = Tables.currentMusicFont();
        return musicFont.lookupMetric('noteHead.minPadding');
    }
    static format(ornaments, state) {
        if (!ornaments || ornaments.length === 0)
            return false;
        let width = 0;
        let right_shift = state.right_shift;
        let left_shift = state.left_shift;
        let yOffset = 0;
        for (let i = 0; i < ornaments.length; ++i) {
            const ornament = ornaments[i];
            const increment = 2;
            if (Ornament.ornamentRelease.indexOf(ornament.type) >= 0) {
                ornament.x_shift += right_shift + 2;
            }
            if (Ornament.ornamentAttack.indexOf(ornament.type) >= 0) {
                ornament.x_shift -= left_shift + 2;
            }
            if (ornament.reportedWidth && ornament.x_shift < 0) {
                left_shift += ornament.reportedWidth;
            }
            else if (ornament.reportedWidth && ornament.x_shift >= 0) {
                right_shift += ornament.reportedWidth + Ornament.minPadding;
            }
            else {
                width = Math.max(ornament.getWidth(), width);
            }
            if (Ornament.ornamentArticulation.indexOf(ornament.type) >= 0) {
                const ornamentNote = defined(ornament.note, 'NoAttachedNote');
                if (ornamentNote.getLineNumber() >= 3 || ornament.getPosition() === Modifier.Position.ABOVE) {
                    state.top_text_line += increment;
                    ornament.y_shift += yOffset;
                    yOffset -= ornament.glyph.bbox.getH();
                }
                else {
                    state.text_line += increment;
                    ornament.y_shift += yOffset;
                    yOffset += ornament.glyph.bbox.getH();
                }
            }
            else {
                if (ornament.getPosition() === Modifier.Position.ABOVE) {
                    ornament.setTextLine(state.top_text_line);
                    state.top_text_line += increment;
                }
                else {
                    ornament.setTextLine(state.text_line);
                    state.text_line += increment;
                }
            }
        }
        state.left_shift = left_shift + width / 2;
        state.right_shift = right_shift + width / 2;
        return true;
    }
    static get ornamentNoteTransition() {
        return ['flip', 'jazzTurn', 'smear'];
    }
    static get ornamentAttack() {
        return ['scoop'];
    }
    static get ornamentAlignWithNoteHead() {
        return ['doit', 'fall', 'fallLong', 'doitLong', 'bend', 'plungerClosed', 'plungerOpen', 'scoop'];
    }
    static get ornamentRelease() {
        return ['doit', 'fall', 'fallLong', 'doitLong', 'jazzTurn', 'smear', 'flip'];
    }
    static get ornamentArticulation() {
        return ['bend', 'plungerClosed', 'plungerOpen'];
    }
    getMetrics() {
        const ornamentMetrics = Tables.currentMusicFont().getMetrics().ornament;
        if (!ornamentMetrics)
            throw new RuntimeError('BadMetrics', `ornament missing`);
        return ornamentMetrics[this.ornament.code];
    }
    constructor(type) {
        super();
        this.type = type;
        this.delayed = false;
        this.render_options = {
            font_scale: Tables.NOTATION_FONT_SCALE,
            accidentalLowerPadding: 3,
            accidentalUpperPadding: 3,
        };
        this.ornament = Tables.ornamentCodes(this.type);
        const metrics = this.getMetrics();
        this.adjustForStemDirection = false;
        this.reportedWidth = metrics && metrics.reportedWidth ? metrics.reportedWidth : 0;
        this.stemUpYOffset = metrics && metrics.stemUpYOffset ? metrics.stemUpYOffset : 0;
        this.ornamentAlignWithNoteHead = Ornament.ornamentAlignWithNoteHead.indexOf(this.type) >= 0;
        if (!this.ornament) {
            throw new RuntimeError('ArgumentError', `Ornament not found: '${this.type}'`);
        }
        this.x_shift = metrics ? metrics.xOffset : 0;
        this.y_shift = metrics ? metrics.yOffset : 0;
        this.glyph = new Glyph(this.ornament.code, this.render_options.font_scale, {
            category: `ornament.${this.ornament.code}`,
        });
        if (Ornament.ornamentNoteTransition.indexOf(this.type) >= 0) {
            this.delayed = true;
        }
        if (!metrics) {
            this.glyph.setOrigin(0.5, 1.0);
        }
    }
    setDelayed(delayed) {
        this.delayed = delayed;
        return this;
    }
    setUpperAccidental(accid) {
        const scale = this.render_options.font_scale / 1.3;
        this.accidentalUpper = new Glyph(Tables.accidentalCodes(accid).code, scale);
        this.accidentalUpper.setOrigin(0.5, 1.0);
        return this;
    }
    setLowerAccidental(accid) {
        const scale = this.render_options.font_scale / 1.3;
        this.accidentalLower = new Glyph(Tables.accidentalCodes(accid).code, scale);
        this.accidentalLower.setOrigin(0.5, 1.0);
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const stemDir = note.getStemDirection();
        const stave = note.checkStave();
        this.applyStyle();
        ctx.openGroup('ornament', this.getAttribute('id'));
        const stemExtents = note.checkStem().getExtents();
        let y = stemDir === Stem.DOWN ? stemExtents.baseY : stemExtents.topY;
        if (isTabNote(note)) {
            if (note.hasStem()) {
                if (stemDir === Stem.DOWN) {
                    y = stave.getYForTopText(this.text_line);
                }
            }
            else {
                y = stave.getYForTopText(this.text_line);
            }
        }
        const isPlacedOnNoteheadSide = stemDir === Stem.DOWN;
        const spacing = stave.getSpacingBetweenLines();
        let lineSpacing = 1;
        if (!isPlacedOnNoteheadSide && note.hasBeam()) {
            lineSpacing += 0.5;
        }
        const totalSpacing = spacing * (this.text_line + lineSpacing);
        const glyphYBetweenLines = y - totalSpacing;
        const start = note.getModifierStartXY(this.position, this.index);
        let glyphX = start.x;
        let glyphY = this.ornamentAlignWithNoteHead
            ? start.y
            : Math.min(stave.getYForTopText(this.text_line), glyphYBetweenLines);
        glyphY += this.y_shift;
        if (this.delayed) {
            let delayXShift = 0;
            const startX = glyphX - stave.getNoteStartX();
            if (this.delayXShift !== undefined) {
                delayXShift = this.delayXShift;
            }
            else {
                delayXShift += this.glyph.getMetrics().width / 2;
                const tickables = note.getVoice().getTickables();
                const index = tickables.indexOf(note);
                const nextContext = index + 1 < tickables.length ? tickables[index + 1].checkTickContext() : undefined;
                if (nextContext) {
                    delayXShift += (nextContext.getX() - startX) * 0.5;
                }
                else {
                    delayXShift += (stave.getX() + stave.getWidth() - glyphX) * 0.5;
                }
                this.delayXShift = delayXShift;
            }
            glyphX += delayXShift;
        }
        L('Rendering ornament: ', this.ornament, glyphX, glyphY);
        if (this.accidentalLower) {
            this.accidentalLower.render(ctx, glyphX, glyphY);
            glyphY -= this.accidentalLower.getMetrics().height;
            glyphY -= this.render_options.accidentalLowerPadding;
        }
        if (this.stemUpYOffset && note.hasStem() && note.getStemDirection() === 1) {
            glyphY += this.stemUpYOffset;
        }
        if (note.getLineNumber() < 5 && Ornament.ornamentNoteTransition.indexOf(this.type) >= 0) {
            glyphY = note.checkStave().getBoundingBox().getY() + 40;
        }
        this.glyph.render(ctx, glyphX + this.x_shift, glyphY);
        if (this.accidentalUpper) {
            glyphY -= this.glyph.getMetrics().height + this.render_options.accidentalUpperPadding;
            this.accidentalUpper.render(ctx, glyphX, glyphY);
        }
        ctx.closeGroup();
        this.restoreStyle();
    }
}
Ornament.DEBUG = false;
export { Ornament };
