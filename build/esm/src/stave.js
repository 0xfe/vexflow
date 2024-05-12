import { BoundingBox } from './boundingbox.js';
import { Clef } from './clef.js';
import { Element } from './element.js';
import { Font, FontStyle, FontWeight } from './font.js';
import { KeySignature } from './keysignature.js';
import { Barline, BarlineType } from './stavebarline.js';
import { StaveModifierPosition } from './stavemodifier.js';
import { Repetition } from './staverepetition.js';
import { StaveSection } from './stavesection.js';
import { StaveTempo } from './stavetempo.js';
import { StaveText } from './stavetext.js';
import { Volta } from './stavevolta.js';
import { Tables } from './tables.js';
import { TimeSignature } from './timesignature.js';
import { isBarline } from './typeguard.js';
import { RuntimeError } from './util.js';
const SORT_ORDER_BEG_MODIFIERS = {
    [Barline.CATEGORY]: 0,
    [Clef.CATEGORY]: 1,
    [KeySignature.CATEGORY]: 2,
    [TimeSignature.CATEGORY]: 3,
};
const SORT_ORDER_END_MODIFIERS = {
    [TimeSignature.CATEGORY]: 0,
    [KeySignature.CATEGORY]: 1,
    [Barline.CATEGORY]: 2,
    [Clef.CATEGORY]: 3,
};
class Stave extends Element {
    static get CATEGORY() {
        return "Stave";
    }
    static get defaultPadding() {
        const musicFont = Tables.currentMusicFont();
        return musicFont.lookupMetric('stave.padding') + musicFont.lookupMetric('stave.endPaddingMax');
    }
    static get rightPadding() {
        const musicFont = Tables.currentMusicFont();
        return musicFont.lookupMetric('stave.endPaddingMax');
    }
    constructor(x, y, width, options) {
        super();
        this.height = 0;
        this.x = x;
        this.y = y;
        this.width = width;
        this.formatted = false;
        this.start_x = x + 5;
        this.end_x = x + width;
        this.modifiers = [];
        this.measure = 0;
        this.clef = 'treble';
        this.endClef = undefined;
        this.resetFont();
        this.options = Object.assign({ vertical_bar_width: 10, num_lines: 5, fill_style: '#999999', left_bar: true, right_bar: true, spacing_between_lines_px: Tables.STAVE_LINE_DISTANCE, space_above_staff_ln: 4, space_below_staff_ln: 4, top_text_position: 1, bottom_text_position: 4, line_config: [] }, options);
        this.bounds = { x: this.x, y: this.y, w: this.width, h: 0 };
        this.defaultLedgerLineStyle = { strokeStyle: '#444', lineWidth: 1.4 };
        this.resetLines();
        this.addModifier(new Barline(this.options.left_bar ? BarlineType.SINGLE : BarlineType.NONE));
        this.addEndModifier(new Barline(this.options.right_bar ? BarlineType.SINGLE : BarlineType.NONE));
    }
    setDefaultLedgerLineStyle(style) {
        this.defaultLedgerLineStyle = style;
    }
    getDefaultLedgerLineStyle() {
        return Object.assign(Object.assign({}, this.getStyle()), this.defaultLedgerLineStyle);
    }
    space(spacing) {
        return this.options.spacing_between_lines_px * spacing;
    }
    resetLines() {
        this.options.line_config = [];
        for (let i = 0; i < this.options.num_lines; i++) {
            this.options.line_config.push({ visible: true });
        }
        this.height = (this.options.num_lines + this.options.space_above_staff_ln) * this.options.spacing_between_lines_px;
        this.options.bottom_text_position = this.options.num_lines;
    }
    setNoteStartX(x) {
        if (!this.formatted)
            this.format();
        this.start_x = x;
        return this;
    }
    getNoteStartX() {
        if (!this.formatted)
            this.format();
        return this.start_x;
    }
    getNoteEndX() {
        if (!this.formatted)
            this.format();
        return this.end_x;
    }
    getTieStartX() {
        return this.start_x;
    }
    getTieEndX() {
        return this.end_x;
    }
    getX() {
        return this.x;
    }
    getNumLines() {
        return this.options.num_lines;
    }
    setNumLines(n) {
        this.options.num_lines = n;
        this.resetLines();
        return this;
    }
    setY(y) {
        this.y = y;
        return this;
    }
    getY() {
        return this.y;
    }
    getTopLineTopY() {
        return this.getYForLine(0) - Tables.STAVE_LINE_THICKNESS / 2;
    }
    getBottomLineBottomY() {
        return this.getYForLine(this.getNumLines() - 1) + Tables.STAVE_LINE_THICKNESS / 2;
    }
    setX(x) {
        const shift = x - this.x;
        this.formatted = false;
        this.x = x;
        this.start_x += shift;
        this.end_x += shift;
        for (let i = 0; i < this.modifiers.length; i++) {
            const mod = this.modifiers[i];
            mod.setX(mod.getX() + shift);
        }
        return this;
    }
    setWidth(width) {
        this.formatted = false;
        this.width = width;
        this.end_x = this.x + width;
        return this;
    }
    getWidth() {
        return this.width;
    }
    getStyle() {
        return Object.assign({ fillStyle: this.options.fill_style, strokeStyle: this.options.fill_style, lineWidth: Tables.STAVE_LINE_THICKNESS }, super.getStyle());
    }
    setMeasure(measure) {
        this.measure = measure;
        return this;
    }
    getMeasure() {
        return this.measure;
    }
    getModifierXShift(index = 0) {
        if (typeof index !== 'number') {
            throw new RuntimeError('InvalidIndex', 'Must be of number type');
        }
        if (!this.formatted)
            this.format();
        if (this.getModifiers(StaveModifierPosition.BEGIN).length === 1) {
            return 0;
        }
        if (this.modifiers[index].getPosition() === StaveModifierPosition.RIGHT) {
            return 0;
        }
        let start_x = this.start_x - this.x;
        const begBarline = this.modifiers[0];
        if (begBarline.getType() === BarlineType.REPEAT_BEGIN && start_x > begBarline.getWidth()) {
            start_x -= begBarline.getWidth();
        }
        return start_x;
    }
    setRepetitionType(type, yShift = 0) {
        this.modifiers.push(new Repetition(type, this.x, yShift));
        return this;
    }
    setVoltaType(type, number_t, y) {
        this.modifiers.push(new Volta(type, number_t, this.x, y));
        return this;
    }
    setSection(section, y, xOffset = 0, fontSize, drawRect = true) {
        const staveSection = new StaveSection(section, this.x + xOffset, y, drawRect);
        if (fontSize)
            staveSection.setFontSize(fontSize);
        this.modifiers.push(staveSection);
        return this;
    }
    setTempo(tempo, y) {
        this.modifiers.push(new StaveTempo(tempo, this.x, y));
        return this;
    }
    setText(text, position, options = {}) {
        this.modifiers.push(new StaveText(text, position, options));
        return this;
    }
    getHeight() {
        return this.height;
    }
    getSpacingBetweenLines() {
        return this.options.spacing_between_lines_px;
    }
    getBoundingBox() {
        return new BoundingBox(this.x, this.y, this.width, this.getBottomY() - this.y);
    }
    getBottomY() {
        const options = this.options;
        const spacing = options.spacing_between_lines_px;
        const score_bottom = this.getYForLine(options.num_lines) + options.space_below_staff_ln * spacing;
        return score_bottom;
    }
    getBottomLineY() {
        return this.getYForLine(this.options.num_lines);
    }
    getYForLine(line) {
        const options = this.options;
        const spacing = options.spacing_between_lines_px;
        const headroom = options.space_above_staff_ln;
        const y = this.y + line * spacing + headroom * spacing;
        return y;
    }
    getLineForY(y) {
        const options = this.options;
        const spacing = options.spacing_between_lines_px;
        const headroom = options.space_above_staff_ln;
        return (y - this.y) / spacing - headroom;
    }
    getYForTopText(line = 0) {
        return this.getYForLine(-line - this.options.top_text_position);
    }
    getYForBottomText(line = 0) {
        return this.getYForLine(this.options.bottom_text_position + line);
    }
    getYForNote(line) {
        const options = this.options;
        const spacing = options.spacing_between_lines_px;
        const headroom = options.space_above_staff_ln;
        return this.y + headroom * spacing + 5 * spacing - line * spacing;
    }
    getYForGlyphs() {
        return this.getYForLine(3);
    }
    addModifier(modifier, position) {
        if (position !== undefined) {
            modifier.setPosition(position);
        }
        modifier.setStave(this);
        this.formatted = false;
        this.modifiers.push(modifier);
        return this;
    }
    addEndModifier(modifier) {
        this.addModifier(modifier, StaveModifierPosition.END);
        return this;
    }
    setBegBarType(type) {
        const { SINGLE, REPEAT_BEGIN, NONE } = BarlineType;
        if (type === SINGLE || type === REPEAT_BEGIN || type === NONE) {
            this.modifiers[0].setType(type);
            this.formatted = false;
        }
        return this;
    }
    setEndBarType(type) {
        if (type !== BarlineType.REPEAT_BEGIN) {
            this.modifiers[1].setType(type);
            this.formatted = false;
        }
        return this;
    }
    setClefLines(clefSpec) {
        this.clef = clefSpec;
        return this;
    }
    setClef(clefSpec, size, annotation, position) {
        if (position === undefined) {
            position = StaveModifierPosition.BEGIN;
        }
        if (position === StaveModifierPosition.END) {
            this.endClef = clefSpec;
        }
        else {
            this.clef = clefSpec;
        }
        const clefs = this.getModifiers(position, Clef.CATEGORY);
        if (clefs.length === 0) {
            this.addClef(clefSpec, size, annotation, position);
        }
        else {
            clefs[0].setType(clefSpec, size, annotation);
        }
        return this;
    }
    getClef() {
        return this.clef;
    }
    setEndClef(clefSpec, size, annotation) {
        this.setClef(clefSpec, size, annotation, StaveModifierPosition.END);
        return this;
    }
    getEndClef() {
        return this.endClef;
    }
    setKeySignature(keySpec, cancelKeySpec, position) {
        if (position === undefined) {
            position = StaveModifierPosition.BEGIN;
        }
        const keySignatures = this.getModifiers(position, KeySignature.CATEGORY);
        if (keySignatures.length === 0) {
            this.addKeySignature(keySpec, cancelKeySpec, position);
        }
        else {
            keySignatures[0].setKeySig(keySpec, cancelKeySpec);
        }
        return this;
    }
    setEndKeySignature(keySpec, cancelKeySpec) {
        this.setKeySignature(keySpec, cancelKeySpec, StaveModifierPosition.END);
        return this;
    }
    setTimeSignature(timeSpec, customPadding, position) {
        if (position === undefined) {
            position = StaveModifierPosition.BEGIN;
        }
        const timeSignatures = this.getModifiers(position, TimeSignature.CATEGORY);
        if (timeSignatures.length === 0) {
            this.addTimeSignature(timeSpec, customPadding, position);
        }
        else {
            timeSignatures[0].setTimeSig(timeSpec);
        }
        return this;
    }
    setEndTimeSignature(timeSpec, customPadding) {
        this.setTimeSignature(timeSpec, customPadding, StaveModifierPosition.END);
        return this;
    }
    addKeySignature(keySpec, cancelKeySpec, position) {
        if (position === undefined) {
            position = StaveModifierPosition.BEGIN;
        }
        this.addModifier(new KeySignature(keySpec, cancelKeySpec).setPosition(position), position);
        return this;
    }
    addClef(clef, size, annotation, position) {
        if (position === undefined || position === StaveModifierPosition.BEGIN) {
            this.clef = clef;
        }
        else if (position === StaveModifierPosition.END) {
            this.endClef = clef;
        }
        this.addModifier(new Clef(clef, size, annotation), position);
        return this;
    }
    addEndClef(clef, size, annotation) {
        this.addClef(clef, size, annotation, StaveModifierPosition.END);
        return this;
    }
    addTimeSignature(timeSpec, customPadding, position) {
        this.addModifier(new TimeSignature(timeSpec, customPadding), position);
        return this;
    }
    addEndTimeSignature(timeSpec, customPadding) {
        this.addTimeSignature(timeSpec, customPadding, StaveModifierPosition.END);
        return this;
    }
    addTrebleGlyph() {
        this.addClef('treble');
        return this;
    }
    getModifiers(position, category) {
        const noPosition = position === undefined;
        const noCategory = category === undefined;
        if (noPosition && noCategory) {
            return this.modifiers;
        }
        else if (noPosition) {
            return this.modifiers.filter((m) => category === m.getCategory());
        }
        else if (noCategory) {
            return this.modifiers.filter((m) => position === m.getPosition());
        }
        else {
            return this.modifiers.filter((m) => position === m.getPosition() && category === m.getCategory());
        }
    }
    sortByCategory(items, order) {
        for (let i = items.length - 1; i >= 0; i--) {
            for (let j = 0; j < i; j++) {
                if (order[items[j].getCategory()] > order[items[j + 1].getCategory()]) {
                    const temp = items[j];
                    items[j] = items[j + 1];
                    items[j + 1] = temp;
                }
            }
        }
    }
    format() {
        const begBarline = this.modifiers[0];
        const endBarline = this.modifiers[1];
        const begModifiers = this.getModifiers(StaveModifierPosition.BEGIN);
        const endModifiers = this.getModifiers(StaveModifierPosition.END);
        this.sortByCategory(begModifiers, SORT_ORDER_BEG_MODIFIERS);
        this.sortByCategory(endModifiers, SORT_ORDER_END_MODIFIERS);
        if (begModifiers.length > 1 && begBarline.getType() === BarlineType.REPEAT_BEGIN) {
            begModifiers.push(begModifiers.splice(0, 1)[0]);
            begModifiers.splice(0, 0, new Barline(BarlineType.SINGLE));
        }
        if (endModifiers.indexOf(endBarline) > 0) {
            endModifiers.splice(0, 0, new Barline(BarlineType.NONE));
        }
        let width;
        let padding;
        let modifier;
        let offset = 0;
        let x = this.x;
        for (let i = 0; i < begModifiers.length; i++) {
            modifier = begModifiers[i];
            padding = modifier.getPadding(i + offset);
            width = modifier.getWidth();
            x += padding;
            modifier.setX(x);
            x += width;
            if (padding + width === 0)
                offset--;
        }
        this.start_x = x;
        x = this.x + this.width;
        const widths = {
            left: 0,
            right: 0,
            paddingRight: 0,
            paddingLeft: 0,
        };
        let lastBarlineIdx = 0;
        for (let i = 0; i < endModifiers.length; i++) {
            modifier = endModifiers[i];
            lastBarlineIdx = isBarline(modifier) ? i : lastBarlineIdx;
            widths.right = 0;
            widths.left = 0;
            widths.paddingRight = 0;
            widths.paddingLeft = 0;
            const layoutMetrics = modifier.getLayoutMetrics();
            if (layoutMetrics) {
                if (i !== 0) {
                    widths.right = layoutMetrics.xMax || 0;
                    widths.paddingRight = layoutMetrics.paddingRight || 0;
                }
                widths.left = -layoutMetrics.xMin || 0;
                widths.paddingLeft = layoutMetrics.paddingLeft || 0;
                if (i === endModifiers.length - 1) {
                    widths.paddingLeft = 0;
                }
            }
            else {
                widths.paddingRight = modifier.getPadding(i - lastBarlineIdx);
                if (i !== 0) {
                    widths.right = modifier.getWidth();
                }
                if (i === 0) {
                    widths.left = modifier.getWidth();
                }
            }
            x -= widths.paddingRight;
            x -= widths.right;
            modifier.setX(x);
            x -= widths.left;
            x -= widths.paddingLeft;
        }
        this.end_x = endModifiers.length === 1 ? this.x + this.width : x;
        this.formatted = true;
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        this.applyStyle();
        ctx.openGroup('stave', this.getAttribute('id'));
        if (!this.formatted)
            this.format();
        const num_lines = this.options.num_lines;
        const width = this.width;
        const x = this.x;
        let y;
        for (let line = 0; line < num_lines; line++) {
            y = this.getYForLine(line);
            if (this.options.line_config[line].visible) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + width, y);
                ctx.stroke();
            }
        }
        ctx.closeGroup();
        this.restoreStyle();
        for (let i = 0; i < this.modifiers.length; i++) {
            const modifier = this.modifiers[i];
            if (typeof modifier.draw === 'function') {
                modifier.applyStyle(ctx);
                modifier.draw(this, this.getModifierXShift(i));
                modifier.restoreStyle(ctx);
            }
        }
        if (this.measure > 0) {
            ctx.save();
            ctx.setFont(this.textFont);
            const textWidth = ctx.measureText('' + this.measure).width;
            y = this.getYForTopText(0) + 3;
            ctx.fillText('' + this.measure, this.x - textWidth / 2, y);
            ctx.restore();
        }
        return this;
    }
    getVerticalBarWidth() {
        return this.options.vertical_bar_width;
    }
    getConfigForLines() {
        return this.options.line_config;
    }
    setConfigForLine(line_number, line_config) {
        if (line_number >= this.options.num_lines || line_number < 0) {
            throw new RuntimeError('StaveConfigError', 'The line number must be within the range of the number of lines in the Stave.');
        }
        if (line_config.visible === undefined) {
            throw new RuntimeError('StaveConfigError', "The line configuration object is missing the 'visible' property.");
        }
        if (typeof line_config.visible !== 'boolean') {
            throw new RuntimeError('StaveConfigError', "The line configuration objects 'visible' property must be true or false.");
        }
        this.options.line_config[line_number] = line_config;
        return this;
    }
    setConfigForLines(lines_configuration) {
        if (lines_configuration.length !== this.options.num_lines) {
            throw new RuntimeError('StaveConfigError', 'The length of the lines configuration array must match the number of lines in the Stave');
        }
        for (const line_config in lines_configuration) {
            if (lines_configuration[line_config].visible == undefined) {
                lines_configuration[line_config] = this.options.line_config[line_config];
            }
            this.options.line_config[line_config] = Object.assign(Object.assign({}, this.options.line_config[line_config]), lines_configuration[line_config]);
        }
        this.options.line_config = lines_configuration;
        return this;
    }
    static formatBegModifiers(staves) {
        const adjustCategoryStartX = (category) => {
            let minStartX = 0;
            staves.forEach((stave) => {
                const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, category);
                if (modifiers.length > 0 && modifiers[0].getX() > minStartX)
                    minStartX = modifiers[0].getX();
            });
            let adjustX = 0;
            staves.forEach((stave) => {
                adjustX = 0;
                const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, category);
                modifiers.forEach((modifier) => {
                    if (minStartX - modifier.getX() > adjustX)
                        adjustX = minStartX - modifier.getX();
                });
                const allModifiers = stave.getModifiers(StaveModifierPosition.BEGIN);
                let bAdjust = false;
                allModifiers.forEach((modifier) => {
                    if (modifier.getCategory() === category)
                        bAdjust = true;
                    if (bAdjust && adjustX > 0)
                        modifier.setX(modifier.getX() + adjustX);
                });
                stave.setNoteStartX(stave.getNoteStartX() + adjustX);
            });
        };
        staves.forEach((stave) => {
            if (!stave.formatted)
                stave.format();
        });
        adjustCategoryStartX("Clef");
        adjustCategoryStartX("KeySignature");
        adjustCategoryStartX("TimeSignature");
        let maxX = 0;
        staves.forEach((stave) => {
            if (stave.getNoteStartX() > maxX)
                maxX = stave.getNoteStartX();
        });
        staves.forEach((stave) => {
            stave.setNoteStartX(maxX);
        });
        maxX = 0;
        staves.forEach((stave) => {
            const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, "Barline");
            modifiers.forEach((modifier) => {
                if (modifier.getType() == BarlineType.REPEAT_BEGIN)
                    if (modifier.getX() > maxX)
                        maxX = modifier.getX();
            });
        });
        staves.forEach((stave) => {
            const modifiers = stave.getModifiers(StaveModifierPosition.BEGIN, "Barline");
            modifiers.forEach((modifier) => {
                if (modifier.getType() == BarlineType.REPEAT_BEGIN)
                    modifier.setX(maxX);
            });
        });
    }
}
Stave.TEXT_FONT = {
    family: Font.SANS_SERIF,
    size: 8,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
};
export { Stave };
