import { Font, FontStyle, FontWeight } from './font.js';
import { StaveModifier } from './stavemodifier.js';
export class StaveSection extends StaveModifier {
    constructor(section, x, shift_y) {
        super();
        this.setWidth(16);
        this.section = section;
        this.x = x;
        this.shift_x = 0;
        this.shift_y = shift_y;
        this.resetFont();
    }
    static get CATEGORY() {
        return "StaveSection";
    }
    setStaveSection(section) {
        this.section = section;
        return this;
    }
    setShiftX(x) {
        this.shift_x = x;
        return this;
    }
    setShiftY(y) {
        this.shift_y = y;
        return this;
    }
    draw(stave, shift_x) {
        const ctx = stave.checkContext();
        this.setRendered();
        ctx.save();
        ctx.setLineWidth(2);
        ctx.setFont(this.textFont);
        const paddingX = 2;
        const paddingY = 2;
        const rectWidth = 2;
        const textMeasurements = ctx.measureText(this.section);
        const textWidth = textMeasurements.width;
        const textHeight = textMeasurements.height;
        const width = textWidth + 2 * paddingX;
        const height = textHeight + 2 * paddingY;
        const y = stave.getYForTopText(2) + this.shift_y;
        const x = this.x + shift_x;
        ctx.beginPath();
        ctx.setLineWidth(rectWidth);
        ctx.rect(x, y + textMeasurements.y - paddingY, width, height);
        ctx.stroke();
        ctx.fillText(this.section, x + paddingX, y);
        ctx.restore();
        return this;
    }
}
StaveSection.TEXT_FONT = {
    family: Font.SANS_SERIF,
    size: 10,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
};
