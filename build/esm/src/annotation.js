import { Element } from './element.js';
import { Modifier, ModifierPosition } from './modifier.js';
import { Stem } from './stem.js';
import { Tables } from './tables.js';
import { TextFormatter } from './textformatter.js';
import { isStemmableNote, isTabNote } from './typeguard.js';
import { log } from './util.js';
function L(...args) {
    if (Annotation.DEBUG)
        log('Vex.Flow.Annotation', args);
}
export var AnnotationHorizontalJustify;
(function (AnnotationHorizontalJustify) {
    AnnotationHorizontalJustify[AnnotationHorizontalJustify["LEFT"] = 1] = "LEFT";
    AnnotationHorizontalJustify[AnnotationHorizontalJustify["CENTER"] = 2] = "CENTER";
    AnnotationHorizontalJustify[AnnotationHorizontalJustify["RIGHT"] = 3] = "RIGHT";
    AnnotationHorizontalJustify[AnnotationHorizontalJustify["CENTER_STEM"] = 4] = "CENTER_STEM";
})(AnnotationHorizontalJustify || (AnnotationHorizontalJustify = {}));
export var AnnotationVerticalJustify;
(function (AnnotationVerticalJustify) {
    AnnotationVerticalJustify[AnnotationVerticalJustify["TOP"] = 1] = "TOP";
    AnnotationVerticalJustify[AnnotationVerticalJustify["CENTER"] = 2] = "CENTER";
    AnnotationVerticalJustify[AnnotationVerticalJustify["BOTTOM"] = 3] = "BOTTOM";
    AnnotationVerticalJustify[AnnotationVerticalJustify["CENTER_STEM"] = 4] = "CENTER_STEM";
})(AnnotationVerticalJustify || (AnnotationVerticalJustify = {}));
class Annotation extends Modifier {
    static get CATEGORY() {
        return "Annotation";
    }
    static get minAnnotationPadding() {
        const musicFont = Tables.currentMusicFont();
        return musicFont.lookupMetric('noteHead.minPadding');
    }
    static format(annotations, state) {
        if (!annotations || annotations.length === 0)
            return false;
        let leftWidth = 0;
        let rightWidth = 0;
        let maxLeftGlyphWidth = 0;
        let maxRightGlyphWidth = 0;
        for (let i = 0; i < annotations.length; ++i) {
            const annotation = annotations[i];
            const textFormatter = TextFormatter.create(annotation.textFont);
            const textLines = (2 + textFormatter.getYForStringInPx(annotation.text).height) / Tables.STAVE_LINE_DISTANCE;
            let verticalSpaceNeeded = textLines;
            const note = annotation.checkAttachedNote();
            const glyphWidth = note.getGlyphProps().getWidth();
            const textWidth = textFormatter.getWidthForTextInPx(annotation.text);
            if (annotation.horizontalJustification === AnnotationHorizontalJustify.LEFT) {
                maxLeftGlyphWidth = Math.max(glyphWidth, maxLeftGlyphWidth);
                leftWidth = Math.max(leftWidth, textWidth) + Annotation.minAnnotationPadding;
            }
            else if (annotation.horizontalJustification === AnnotationHorizontalJustify.RIGHT) {
                maxRightGlyphWidth = Math.max(glyphWidth, maxRightGlyphWidth);
                rightWidth = Math.max(rightWidth, textWidth);
            }
            else {
                leftWidth = Math.max(leftWidth, textWidth / 2) + Annotation.minAnnotationPadding;
                rightWidth = Math.max(rightWidth, textWidth / 2);
                maxLeftGlyphWidth = Math.max(glyphWidth / 2, maxLeftGlyphWidth);
                maxRightGlyphWidth = Math.max(glyphWidth / 2, maxRightGlyphWidth);
            }
            const stave = note.getStave();
            const stemDirection = note.hasStem() ? note.getStemDirection() : Stem.UP;
            let stemHeight = 0;
            let lines = 5;
            if (isTabNote(note)) {
                if (note.render_options.draw_stem) {
                    const stem = note.getStem();
                    if (stem) {
                        stemHeight = Math.abs(stem.getHeight()) / Tables.STAVE_LINE_DISTANCE;
                    }
                }
                else {
                    stemHeight = 0;
                }
            }
            else if (isStemmableNote(note)) {
                const stem = note.getStem();
                if (stem && note.getNoteType() === 'n') {
                    stemHeight = Math.abs(stem.getHeight()) / Tables.STAVE_LINE_DISTANCE;
                }
            }
            if (stave) {
                lines = stave.getNumLines();
            }
            if (annotation.verticalJustification === this.VerticalJustify.TOP) {
                let noteLine = note.getLineNumber(true);
                if (isTabNote(note)) {
                    noteLine = lines - (note.leastString() - 0.5);
                }
                if (stemDirection === Stem.UP) {
                    noteLine += stemHeight;
                }
                const curTop = noteLine + state.top_text_line + 0.5;
                if (curTop < lines) {
                    annotation.setTextLine(lines - noteLine);
                    verticalSpaceNeeded += lines - noteLine;
                    state.top_text_line = verticalSpaceNeeded;
                }
                else {
                    annotation.setTextLine(state.top_text_line);
                    state.top_text_line += verticalSpaceNeeded;
                }
            }
            else if (annotation.verticalJustification === this.VerticalJustify.BOTTOM) {
                let noteLine = lines - note.getLineNumber();
                if (isTabNote(note)) {
                    noteLine = note.greatestString() - 1;
                }
                if (stemDirection === Stem.DOWN) {
                    noteLine += stemHeight;
                }
                const curBottom = noteLine + state.text_line + 1;
                if (curBottom < lines) {
                    annotation.setTextLine(lines - curBottom);
                    verticalSpaceNeeded += lines - curBottom;
                    state.text_line = verticalSpaceNeeded;
                }
                else {
                    annotation.setTextLine(state.text_line);
                    state.text_line += verticalSpaceNeeded;
                }
            }
            else {
                annotation.setTextLine(state.text_line);
            }
        }
        const rightOverlap = Math.min(Math.max(rightWidth - maxRightGlyphWidth, 0), Math.max(rightWidth - state.right_shift, 0));
        const leftOverlap = Math.min(Math.max(leftWidth - maxLeftGlyphWidth, 0), Math.max(leftWidth - state.left_shift, 0));
        state.left_shift += leftOverlap;
        state.right_shift += rightOverlap;
        return true;
    }
    constructor(text) {
        super();
        this.text = text;
        this.horizontalJustification = AnnotationHorizontalJustify.CENTER;
        this.verticalJustification = AnnotationVerticalJustify.TOP;
        this.resetFont();
        this.setWidth(Tables.textWidth(text));
    }
    setVerticalJustification(just) {
        this.verticalJustification = typeof just === 'string' ? Annotation.VerticalJustifyString[just] : just;
        return this;
    }
    getJustification() {
        return this.horizontalJustification;
    }
    setJustification(just) {
        this.horizontalJustification = typeof just === 'string' ? Annotation.HorizontalJustifyString[just] : just;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        const stemDirection = note.hasStem() ? note.getStemDirection() : Stem.UP;
        const textFormatter = TextFormatter.create(this.textFont);
        const start = note.getModifierStartXY(ModifierPosition.ABOVE, this.index);
        this.setRendered();
        ctx.save();
        this.applyStyle();
        ctx.openGroup('annotation', this.getAttribute('id'));
        ctx.setFont(this.textFont);
        const text_width = textFormatter.getWidthForTextInPx(this.text);
        const text_height = textFormatter.getYForStringInPx(this.text).height;
        let x;
        let y;
        if (this.horizontalJustification === AnnotationHorizontalJustify.LEFT) {
            x = start.x;
        }
        else if (this.horizontalJustification === AnnotationHorizontalJustify.RIGHT) {
            x = start.x - text_width;
        }
        else if (this.horizontalJustification === AnnotationHorizontalJustify.CENTER) {
            x = start.x - text_width / 2;
        }
        else {
            x = note.getStemX() - text_width / 2;
        }
        let stem_ext = {};
        let spacing = 0;
        const has_stem = note.hasStem();
        const stave = note.checkStave();
        if (has_stem) {
            stem_ext = note.checkStem().getExtents();
            spacing = stave.getSpacingBetweenLines();
        }
        if (this.verticalJustification === AnnotationVerticalJustify.BOTTOM) {
            const ys = note.getYs();
            y = ys.reduce((a, b) => (a > b ? a : b));
            y += (this.text_line + 1) * Tables.STAVE_LINE_DISTANCE + text_height;
            if (has_stem && stemDirection === Stem.DOWN) {
                y = Math.max(y, stem_ext.topY + text_height + spacing * this.text_line);
            }
        }
        else if (this.verticalJustification === AnnotationVerticalJustify.CENTER) {
            const yt = note.getYForTopText(this.text_line) - 1;
            const yb = stave.getYForBottomText(this.text_line);
            y = yt + (yb - yt) / 2 + text_height / 2;
        }
        else if (this.verticalJustification === AnnotationVerticalJustify.TOP) {
            const topY = Math.min(...note.getYs());
            y = topY - (this.text_line + 1) * Tables.STAVE_LINE_DISTANCE;
            if (has_stem && stemDirection === Stem.UP) {
                spacing = stem_ext.topY < stave.getTopLineTopY() ? Tables.STAVE_LINE_DISTANCE : spacing;
                y = Math.min(y, stem_ext.topY - spacing * (this.text_line + 1));
            }
        }
        else {
            const extents = note.getStemExtents();
            y = extents.topY + (extents.baseY - extents.topY) / 2 + text_height / 2;
        }
        L('Rendering annotation: ', this.text, x, y);
        ctx.fillText(this.text, x, y);
        ctx.closeGroup();
        this.restoreStyle();
        ctx.restore();
    }
}
Annotation.DEBUG = false;
Annotation.TEXT_FONT = Object.assign({}, Element.TEXT_FONT);
Annotation.HorizontalJustify = AnnotationHorizontalJustify;
Annotation.HorizontalJustifyString = {
    left: AnnotationHorizontalJustify.LEFT,
    right: AnnotationHorizontalJustify.RIGHT,
    center: AnnotationHorizontalJustify.CENTER,
    centerStem: AnnotationHorizontalJustify.CENTER_STEM,
};
Annotation.VerticalJustify = AnnotationVerticalJustify;
Annotation.VerticalJustifyString = {
    above: AnnotationVerticalJustify.TOP,
    top: AnnotationVerticalJustify.TOP,
    below: AnnotationVerticalJustify.BOTTOM,
    bottom: AnnotationVerticalJustify.BOTTOM,
    center: AnnotationVerticalJustify.CENTER,
    centerStem: AnnotationVerticalJustify.CENTER_STEM,
};
export { Annotation };
