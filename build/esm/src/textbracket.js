import { Element } from './element.js';
import { Font, FontStyle, FontWeight } from './font.js';
import { Renderer } from './renderer.js';
import { Tables } from './tables.js';
import { log, RuntimeError } from './util.js';
function L(...args) {
    if (TextBracket.DEBUG)
        log('Vex.Flow.TextBracket', args);
}
export var TextBracketPosition;
(function (TextBracketPosition) {
    TextBracketPosition[TextBracketPosition["TOP"] = 1] = "TOP";
    TextBracketPosition[TextBracketPosition["BOTTOM"] = -1] = "BOTTOM";
})(TextBracketPosition || (TextBracketPosition = {}));
class TextBracket extends Element {
    static get CATEGORY() {
        return "TextBracket";
    }
    static get Position() {
        return TextBracketPosition;
    }
    static get PositionString() {
        return {
            top: TextBracketPosition.TOP,
            bottom: TextBracketPosition.BOTTOM,
        };
    }
    static get Positions() {
        L('Positions is deprecated, use TextBracketPosition instead.');
        return TextBracketPosition;
    }
    static get PositionsString() {
        L('PositionsString is deprecated, use PositionString instead.');
        return TextBracket.PositionString;
    }
    constructor({ start, stop, text = '', superscript = '', position = TextBracketPosition.TOP }) {
        super();
        this.start = start;
        this.stop = stop;
        this.text = text;
        this.superscript = superscript;
        this.position = typeof position === 'string' ? TextBracket.PositionString[position] : position;
        this.line = 1;
        this.resetFont();
        this.render_options = {
            dashed: true,
            dash: [5],
            color: 'black',
            line_width: 1,
            show_bracket: true,
            bracket_height: 8,
            underline_superscript: true,
        };
    }
    applyStyle(ctx) {
        ctx.setFont(this.font);
        const options = this.render_options;
        ctx.setStrokeStyle(options.color);
        ctx.setFillStyle(options.color);
        ctx.setLineWidth(options.line_width);
        return this;
    }
    setDashed(dashed, dash) {
        this.render_options.dashed = dashed;
        if (dash)
            this.render_options.dash = dash;
        return this;
    }
    setLine(line) {
        this.line = line;
        return this;
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        let y = 0;
        switch (this.position) {
            case TextBracketPosition.TOP:
                y = this.start.checkStave().getYForTopText(this.line);
                break;
            case TextBracketPosition.BOTTOM:
                y = this.start.checkStave().getYForBottomText(this.line + Tables.TEXT_HEIGHT_OFFSET_HACK);
                break;
            default:
                throw new RuntimeError('InvalidPosition', `The position ${this.position} is invalid.`);
        }
        const start = { x: this.start.getAbsoluteX(), y };
        const stop = { x: this.stop.getAbsoluteX(), y };
        L('Rendering TextBracket: start:', start, 'stop:', stop, 'y:', y);
        const bracket_height = this.render_options.bracket_height * this.position;
        ctx.save();
        this.applyStyle(ctx);
        ctx.fillText(this.text, start.x, start.y);
        const main_measure = ctx.measureText(this.text);
        const main_width = main_measure.width;
        const main_height = main_measure.height;
        const super_y = start.y - main_height / 2.5;
        const { family, size, weight, style } = this.textFont;
        const smallerFontSize = Font.scaleSize(size, 0.714286);
        ctx.setFont(family, smallerFontSize, weight, style);
        ctx.fillText(this.superscript, start.x + main_width + 1, super_y);
        const super_measure = ctx.measureText(this.superscript);
        const super_width = super_measure.width;
        const super_height = super_measure.height;
        let start_x = start.x;
        let line_y = super_y;
        const end_x = stop.x + this.stop.getGlyphProps().getWidth();
        if (this.position === TextBracketPosition.TOP) {
            start_x += main_width + super_width + 5;
            line_y -= super_height / 2.7;
        }
        else if (this.position === TextBracketPosition.BOTTOM) {
            line_y += super_height / 2.7;
            start_x += main_width + 2;
            if (!this.render_options.underline_superscript) {
                start_x += super_width;
            }
        }
        if (this.render_options.dashed) {
            Renderer.drawDashedLine(ctx, start_x, line_y, end_x, line_y, this.render_options.dash);
            if (this.render_options.show_bracket) {
                Renderer.drawDashedLine(ctx, end_x, line_y + 1 * this.position, end_x, line_y + bracket_height, this.render_options.dash);
            }
        }
        else {
            ctx.beginPath();
            ctx.moveTo(start_x, line_y);
            ctx.lineTo(end_x, line_y);
            if (this.render_options.show_bracket) {
                ctx.lineTo(end_x, line_y + bracket_height);
            }
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }
}
TextBracket.DEBUG = false;
TextBracket.TEXT_FONT = {
    family: Font.SERIF,
    size: 15,
    weight: FontWeight.NORMAL,
    style: FontStyle.ITALIC,
};
export { TextBracket };
