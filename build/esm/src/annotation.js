import { Element } from './element.js';
import { Modifier, ModifierPosition } from './modifier.js';
import { Stem } from './stem.js';
import { StemmableNote } from './stemmablenote.js';
import { Tables } from './tables.js';
import { TabNote } from './tabnote.js';
import { TextFormatter } from './textformatter.js';
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
export class Annotation extends Modifier {
    constructor(text) {
        super();
        this.text = text;
        this.horizontalJustification = AnnotationHorizontalJustify.CENTER;
        this.verticalJustification = AnnotationVerticalJustify.TOP;
        this.resetFont();
        this.setWidth(Tables.textWidth(text));
    }
    static get CATEGORY() {
        return 'Annotation';
    }
    static format(annotations, state) {
        if (!annotations || annotations.length === 0)
            return false;
        let width = 0;
        for (let i = 0; i < annotations.length; ++i) {
            const annotation = annotations[i];
            const textFormatter = TextFormatter.create(annotation.textFont);
            const textLines = (5 + textFormatter.maxHeight) / Tables.STAVE_LINE_DISTANCE;
            let verticalSpaceNeeded = textLines;
            const note = annotation.checkAttachedNote();
            const stave = note.getStave();
            const stemDirection = note.hasStem() ? note.getStemDirection() : Stem.UP;
            let stemHeight = 0;
            let lines = 5;
            if (note instanceof TabNote) {
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
            else if (note instanceof StemmableNote) {
                const stem = note.getStem();
                if (stem && note.getNoteType() === 'n') {
                    stemHeight = Math.abs(stem.getHeight()) / Tables.STAVE_LINE_DISTANCE;
                }
            }
            if (stave) {
                lines = stave.getNumLines();
            }
            const textWidth = textFormatter.getWidthForTextInPx(annotation.text);
            width = Math.max(width, textWidth);
            if (annotation.verticalJustification === this.VerticalJustify.TOP) {
                let noteLine = note.getLineNumber(true);
                if (note instanceof TabNote) {
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
                if (note instanceof TabNote) {
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
        state.left_shift += width / 2;
        state.right_shift += width / 2;
        return true;
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
        const classString = Object.keys(this.getAttribute('classes')).join(' ');
        ctx.openGroup(classString, this.getAttribute('id'));
        ctx.setFont(this.textFont);
        const text_width = ctx.measureText(this.text).width;
        const text_height = textFormatter.maxHeight + 2;
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
            y = note.getYs()[0] - (this.text_line + 1) * Tables.STAVE_LINE_DISTANCE;
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
