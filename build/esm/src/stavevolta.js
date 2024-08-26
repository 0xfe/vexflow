import { Font, FontStyle, FontWeight } from './font.js';
import { StaveModifier } from './stavemodifier.js';
export var VoltaType;
(function (VoltaType) {
    VoltaType[VoltaType["NONE"] = 1] = "NONE";
    VoltaType[VoltaType["BEGIN"] = 2] = "BEGIN";
    VoltaType[VoltaType["MID"] = 3] = "MID";
    VoltaType[VoltaType["END"] = 4] = "END";
    VoltaType[VoltaType["BEGIN_END"] = 5] = "BEGIN_END";
})(VoltaType || (VoltaType = {}));
class Volta extends StaveModifier {
    static get CATEGORY() {
        return "Volta";
    }
    static get type() {
        return VoltaType;
    }
    constructor(type, number, x, y_shift) {
        super();
        this.volta = type;
        this.x = x;
        this.y_shift = y_shift;
        this.number = number;
        this.resetFont();
    }
    setShiftY(y) {
        this.y_shift = y;
        return this;
    }
    draw(stave, x) {
        const ctx = stave.checkContext();
        this.setRendered();
        let width = stave.getWidth() - x;
        const top_y = stave.getYForTopText(stave.getNumLines()) + this.y_shift;
        const vert_height = 1.5 * stave.getSpacingBetweenLines();
        switch (this.volta) {
            case VoltaType.BEGIN:
                ctx.fillRect(this.x + x, top_y, 1, vert_height);
                break;
            case VoltaType.END:
                width -= 5;
                ctx.fillRect(this.x + x + width, top_y, 1, vert_height);
                break;
            case VoltaType.BEGIN_END:
                width -= 3;
                ctx.fillRect(this.x + x, top_y, 1, vert_height);
                ctx.fillRect(this.x + x + width, top_y, 1, vert_height);
                break;
            default:
                break;
        }
        if (this.volta === VoltaType.BEGIN || this.volta === VoltaType.BEGIN_END) {
            ctx.save();
            ctx.setFont(this.textFont);
            ctx.fillText(this.number, this.x + x + 5, top_y + 15);
            ctx.restore();
        }
        ctx.fillRect(this.x + x, top_y, width, 1);
        return this;
    }
}
Volta.TEXT_FONT = {
    family: Font.SANS_SERIF,
    size: 9,
    weight: FontWeight.BOLD,
    style: FontStyle.NORMAL,
};
export { Volta };
