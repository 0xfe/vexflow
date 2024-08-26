import { Font, FontStyle, FontWeight } from './font.js';
import { StaveModifier } from './stavemodifier.js';
import { TextFormatter } from './textformatter.js';
class StaveSection extends StaveModifier {
    static get CATEGORY() {
        return "StaveSection";
    }
    constructor(section, x, shift_y, drawRect = true) {
        super();
        this.setWidth(16);
        this.section = section;
        this.x = x;
        this.shift_x = 0;
        this.shift_y = shift_y;
        this.drawRect = drawRect;
        this.resetFont();
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
        const borderWidth = 2;
        const padding = 2;
        const ctx = stave.checkContext();
        this.setRendered();
        ctx.save();
        ctx.setLineWidth(borderWidth);
        ctx.setFont(this.textFont);
        const textFormatter = TextFormatter.create(this.textFont);
        const textWidth = textFormatter.getWidthForTextInPx(this.section);
        const textY = textFormatter.getYForStringInPx(this.section);
        const textHeight = textY.height;
        const headroom = -1 * textY.yMin;
        const width = textWidth + 2 * padding;
        const height = textHeight + 2 * padding;
        const y = stave.getYForTopText(1.5) + this.shift_y;
        const x = this.x + shift_x;
        if (this.drawRect) {
            ctx.beginPath();
            ctx.rect(x, y - height + headroom, width, height);
            ctx.stroke();
        }
        ctx.fillText(this.section, x + padding, y - padding);
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
export { StaveSection };
