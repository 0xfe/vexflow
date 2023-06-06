import { Element } from './element.js';
import { Modifier } from './modifier.js';
import { TextFormatter } from './textformatter.js';
import { isTabNote } from './typeguard.js';
import { RuntimeError } from './util.js';
class Bend extends Modifier {
    static get CATEGORY() {
        return "Bend";
    }
    static get UP() {
        return 0;
    }
    static get DOWN() {
        return 1;
    }
    static format(bends, state) {
        if (!bends || bends.length === 0)
            return false;
        let last_width = 0;
        for (let i = 0; i < bends.length; ++i) {
            const bend = bends[i];
            const note = bend.checkAttachedNote();
            if (isTabNote(note)) {
                const stringPos = note.leastString() - 1;
                if (state.top_text_line < stringPos) {
                    state.top_text_line = stringPos;
                }
            }
            bend.setXShift(last_width);
            last_width = bend.getWidth();
            bend.setTextLine(state.top_text_line);
        }
        state.right_shift += last_width;
        state.top_text_line += 1;
        return true;
    }
    constructor(text, release = false, phrase) {
        super();
        this.text = text;
        this.x_shift = 0;
        this.release = release;
        this.tap = '';
        this.resetFont();
        this.render_options = {
            line_width: 1.5,
            line_style: '#777777',
            bend_width: 8,
            release_width: 8,
        };
        if (phrase) {
            this.phrase = phrase;
        }
        else {
            this.phrase = [{ type: Bend.UP, text: this.text }];
            if (this.release)
                this.phrase.push({ type: Bend.DOWN, text: '' });
        }
        this.updateWidth();
    }
    setXShift(value) {
        this.x_shift = value;
        this.updateWidth();
        return this;
    }
    setTap(value) {
        this.tap = value;
        return this;
    }
    getText() {
        return this.text;
    }
    getTextHeight() {
        const textFormatter = TextFormatter.create(this.textFont);
        return textFormatter.maxHeight;
    }
    updateWidth() {
        const textFormatter = TextFormatter.create(this.textFont);
        const measureText = (text) => {
            return textFormatter.getWidthForTextInPx(text);
        };
        let totalWidth = 0;
        for (let i = 0; i < this.phrase.length; ++i) {
            const bend = this.phrase[i];
            if (bend.width !== undefined) {
                totalWidth += bend.width;
            }
            else {
                const additional_width = bend.type === Bend.UP ? this.render_options.bend_width : this.render_options.release_width;
                bend.width = Math.max(additional_width, measureText(bend.text)) + 3;
                bend.draw_width = bend.width / 2;
                totalWidth += bend.width;
            }
        }
        this.setWidth(totalWidth + this.x_shift);
        return this;
    }
    draw() {
        var _a;
        const ctx = this.checkContext();
        const note = this.checkAttachedNote();
        this.setRendered();
        const start = note.getModifierStartXY(Modifier.Position.RIGHT, this.index);
        start.x += 3;
        start.y += 0.5;
        const x_shift = this.x_shift;
        const stave = note.checkStave();
        const spacing = stave.getSpacingBetweenLines();
        const lowestY = note.getYs().reduce((a, b) => (a < b ? a : b));
        const bend_height = start.y - ((this.text_line + 1) * spacing + start.y - lowestY) + 3;
        const annotation_y = start.y - ((this.text_line + 1) * spacing + start.y - lowestY) - 1;
        const renderBend = (x, y, width, height) => {
            const cp_x = x + width;
            const cp_y = y;
            ctx.save();
            ctx.beginPath();
            ctx.setLineWidth(this.render_options.line_width);
            ctx.setStrokeStyle(this.render_options.line_style);
            ctx.setFillStyle(this.render_options.line_style);
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(cp_x, cp_y, x + width, height);
            ctx.stroke();
            ctx.restore();
        };
        const renderRelease = (x, y, width, height) => {
            ctx.save();
            ctx.beginPath();
            ctx.setLineWidth(this.render_options.line_width);
            ctx.setStrokeStyle(this.render_options.line_style);
            ctx.setFillStyle(this.render_options.line_style);
            ctx.moveTo(x, height);
            ctx.quadraticCurveTo(x + width, height, x + width, y);
            ctx.stroke();
            ctx.restore();
        };
        const renderArrowHead = (x, y, direction) => {
            const width = 4;
            const yBase = y + width * direction;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - width, yBase);
            ctx.lineTo(x + width, yBase);
            ctx.closePath();
            ctx.fill();
        };
        const renderText = (x, text) => {
            ctx.save();
            ctx.setFont(this.textFont);
            const render_x = x - ctx.measureText(text).width / 2;
            ctx.fillText(text, render_x, annotation_y);
            ctx.restore();
        };
        let last_bend = undefined;
        let last_bend_draw_width = 0;
        let last_drawn_width = 0;
        if ((_a = this.tap) === null || _a === void 0 ? void 0 : _a.length) {
            const tapStart = note.getModifierStartXY(Modifier.Position.CENTER, this.index);
            renderText(tapStart.x, this.tap);
        }
        for (let i = 0; i < this.phrase.length; ++i) {
            const bend = this.phrase[i];
            if (!bend.draw_width)
                bend.draw_width = 0;
            if (i === 0)
                bend.draw_width += x_shift;
            last_drawn_width = bend.draw_width + last_bend_draw_width - (i === 1 ? x_shift : 0);
            if (bend.type === Bend.UP) {
                if (last_bend && last_bend.type === Bend.UP) {
                    renderArrowHead(start.x, bend_height, +1);
                }
                renderBend(start.x, start.y, last_drawn_width, bend_height);
            }
            if (bend.type === Bend.DOWN) {
                if (last_bend && last_bend.type === Bend.UP) {
                    renderRelease(start.x, start.y, last_drawn_width, bend_height);
                }
                if (last_bend && last_bend.type === Bend.DOWN) {
                    renderArrowHead(start.x, start.y, -1);
                    renderRelease(start.x, start.y, last_drawn_width, bend_height);
                }
                if (!last_bend) {
                    last_drawn_width = bend.draw_width;
                    renderRelease(start.x, start.y, last_drawn_width, bend_height);
                }
            }
            renderText(start.x + last_drawn_width, bend.text);
            last_bend = bend;
            last_bend_draw_width = bend.draw_width;
            last_bend.x = start.x;
            start.x += last_drawn_width;
        }
        if (!last_bend || last_bend.x == undefined) {
            throw new RuntimeError('NoLastBendForBend', 'Internal error.');
        }
        if (last_bend.type === Bend.UP) {
            renderArrowHead(last_bend.x + last_drawn_width, bend_height, +1);
        }
        else if (last_bend.type === Bend.DOWN) {
            renderArrowHead(last_bend.x + last_drawn_width, start.y, -1);
        }
    }
}
Bend.TEXT_FONT = Object.assign({}, Element.TEXT_FONT);
export { Bend };
