import { Element } from './element.js';
import { Font, FontStyle, FontWeight } from './font.js';
import { Glyph } from './glyph.js';
import { Tables } from './tables.js';
import { RuntimeError } from './util.js';
function drawBoldDoubleLine(ctx, type, topX, topY, botY) {
    if (type !== StaveConnector.type.BOLD_DOUBLE_LEFT && type !== StaveConnector.type.BOLD_DOUBLE_RIGHT) {
        throw new RuntimeError('InvalidConnector', 'A REPEAT_BEGIN or REPEAT_END type must be provided.');
    }
    let x_shift = 3;
    let variableWidth = 3.5;
    const thickLineOffset = 2;
    if (type === StaveConnector.type.BOLD_DOUBLE_RIGHT) {
        x_shift = -5;
        variableWidth = 3;
    }
    ctx.fillRect(topX + x_shift, topY, 1, botY - topY);
    ctx.fillRect(topX - thickLineOffset, topY, variableWidth, botY - topY);
}
class StaveConnector extends Element {
    static get CATEGORY() {
        return "StaveConnector";
    }
    constructor(top_stave, bottom_stave) {
        super();
        this.thickness = Tables.STAVE_LINE_THICKNESS;
        this.width = 3;
        this.top_stave = top_stave;
        this.bottom_stave = bottom_stave;
        this.type = StaveConnector.type.DOUBLE;
        this.resetFont();
        this.x_shift = 0;
        this.texts = [];
    }
    setType(type) {
        const newType = typeof type === 'string' ? StaveConnector.typeString[type] : type;
        if (Object.values(StaveConnector.type).includes(newType)) {
            this.type = newType;
        }
        return this;
    }
    getType() {
        return this.type;
    }
    setText(text, options = {}) {
        this.texts.push({
            content: text,
            options: Object.assign({ shift_x: 0, shift_y: 0 }, options),
        });
        return this;
    }
    setXShift(x_shift) {
        if (typeof x_shift !== 'number') {
            throw new RuntimeError('InvalidType', 'x_shift must be a Number');
        }
        this.x_shift = x_shift;
        return this;
    }
    getXShift() {
        return this.x_shift;
    }
    draw() {
        const ctx = this.checkContext();
        this.setRendered();
        let topY = this.top_stave.getYForLine(0);
        let botY = this.bottom_stave.getYForLine(this.bottom_stave.getNumLines() - 1) + this.thickness;
        let width = this.width;
        let topX = this.top_stave.getX();
        const isRightSidedConnector = this.type === StaveConnector.type.SINGLE_RIGHT ||
            this.type === StaveConnector.type.BOLD_DOUBLE_RIGHT ||
            this.type === StaveConnector.type.THIN_DOUBLE;
        if (isRightSidedConnector) {
            topX = this.top_stave.getX() + this.top_stave.getWidth();
        }
        let attachment_height = botY - topY;
        switch (this.type) {
            case StaveConnector.type.SINGLE:
                width = 1;
                break;
            case StaveConnector.type.SINGLE_LEFT:
                width = 1;
                break;
            case StaveConnector.type.SINGLE_RIGHT:
                width = 1;
                break;
            case StaveConnector.type.DOUBLE:
                topX -= this.width + 2;
                topY -= this.thickness;
                attachment_height += 0.5;
                break;
            case StaveConnector.type.BRACE: {
                width = 12;
                const x1 = this.top_stave.getX() - 2 + this.x_shift;
                const y1 = topY;
                const x3 = x1;
                const y3 = botY;
                const x2 = x1 - width;
                const y2 = y1 + attachment_height / 2.0;
                const cpx1 = x2 - 0.9 * width;
                const cpy1 = y1 + 0.2 * attachment_height;
                const cpx2 = x1 + 1.1 * width;
                const cpy2 = y2 - 0.135 * attachment_height;
                const cpx3 = cpx2;
                const cpy3 = y2 + 0.135 * attachment_height;
                const cpx4 = cpx1;
                const cpy4 = y3 - 0.2 * attachment_height;
                const cpx5 = x2 - width;
                const cpy5 = cpy4;
                const cpx6 = x1 + 0.4 * width;
                const cpy6 = y2 + 0.135 * attachment_height;
                const cpx7 = cpx6;
                const cpy7 = y2 - 0.135 * attachment_height;
                const cpx8 = cpx5;
                const cpy8 = cpy1;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
                ctx.bezierCurveTo(cpx3, cpy3, cpx4, cpy4, x3, y3);
                ctx.bezierCurveTo(cpx5, cpy5, cpx6, cpy6, x2, y2);
                ctx.bezierCurveTo(cpx7, cpy7, cpx8, cpy8, x1, y1);
                ctx.fill();
                ctx.stroke();
                break;
            }
            case StaveConnector.type.BRACKET:
                topY -= 6;
                botY += 6;
                attachment_height = botY - topY;
                Glyph.renderGlyph(ctx, topX - 5, topY, 40, 'bracketTop');
                Glyph.renderGlyph(ctx, topX - 5, botY, 40, 'bracketBottom');
                topX -= this.width + 2;
                break;
            case StaveConnector.type.BOLD_DOUBLE_LEFT:
                drawBoldDoubleLine(ctx, this.type, topX + this.x_shift, topY, botY - this.thickness);
                break;
            case StaveConnector.type.BOLD_DOUBLE_RIGHT:
                drawBoldDoubleLine(ctx, this.type, topX, topY, botY - this.thickness);
                break;
            case StaveConnector.type.THIN_DOUBLE:
                width = 1;
                attachment_height -= this.thickness;
                break;
            case StaveConnector.type.NONE:
                break;
            default:
                throw new RuntimeError('InvalidType', `The provided StaveConnector.type (${this.type}) is invalid.`);
        }
        if (this.type !== StaveConnector.type.BRACE &&
            this.type !== StaveConnector.type.BOLD_DOUBLE_LEFT &&
            this.type !== StaveConnector.type.BOLD_DOUBLE_RIGHT &&
            this.type !== StaveConnector.type.NONE) {
            ctx.fillRect(topX, topY, width, attachment_height);
        }
        if (this.type === StaveConnector.type.THIN_DOUBLE) {
            ctx.fillRect(topX - 3, topY, width, attachment_height);
        }
        ctx.save();
        ctx.setLineWidth(2);
        ctx.setFont(this.textFont);
        for (let i = 0; i < this.texts.length; i++) {
            const text = this.texts[i];
            const text_width = ctx.measureText('' + text.content).width;
            const x = this.top_stave.getX() - text_width - 24 + text.options.shift_x;
            const y = (this.top_stave.getYForLine(0) + this.bottom_stave.getBottomLineY()) / 2 + text.options.shift_y;
            ctx.fillText('' + text.content, x, y + 4);
        }
        ctx.restore();
    }
}
StaveConnector.TEXT_FONT = {
    family: Font.SERIF,
    size: 16,
    weight: FontWeight.NORMAL,
    style: FontStyle.NORMAL,
};
StaveConnector.type = {
    SINGLE_RIGHT: 0,
    SINGLE_LEFT: 1,
    SINGLE: 1,
    DOUBLE: 2,
    BRACE: 3,
    BRACKET: 4,
    BOLD_DOUBLE_LEFT: 5,
    BOLD_DOUBLE_RIGHT: 6,
    THIN_DOUBLE: 7,
    NONE: 8,
};
StaveConnector.typeString = {
    singleRight: StaveConnector.type.SINGLE_RIGHT,
    singleLeft: StaveConnector.type.SINGLE_LEFT,
    single: StaveConnector.type.SINGLE,
    double: StaveConnector.type.DOUBLE,
    brace: StaveConnector.type.BRACE,
    bracket: StaveConnector.type.BRACKET,
    boldDoubleLeft: StaveConnector.type.BOLD_DOUBLE_LEFT,
    boldDoubleRight: StaveConnector.type.BOLD_DOUBLE_RIGHT,
    thinDouble: StaveConnector.type.THIN_DOUBLE,
    none: StaveConnector.type.NONE,
};
export { StaveConnector };
