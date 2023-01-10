import { Element } from './element.js';
import { defined } from './util.js';
export var StaveModifierPosition;
(function (StaveModifierPosition) {
    StaveModifierPosition[StaveModifierPosition["CENTER"] = 0] = "CENTER";
    StaveModifierPosition[StaveModifierPosition["LEFT"] = 1] = "LEFT";
    StaveModifierPosition[StaveModifierPosition["RIGHT"] = 2] = "RIGHT";
    StaveModifierPosition[StaveModifierPosition["ABOVE"] = 3] = "ABOVE";
    StaveModifierPosition[StaveModifierPosition["BELOW"] = 4] = "BELOW";
    StaveModifierPosition[StaveModifierPosition["BEGIN"] = 5] = "BEGIN";
    StaveModifierPosition[StaveModifierPosition["END"] = 6] = "END";
})(StaveModifierPosition || (StaveModifierPosition = {}));
export class StaveModifier extends Element {
    static get CATEGORY() {
        return "StaveModifier";
    }
    static get Position() {
        return StaveModifierPosition;
    }
    constructor() {
        super();
        this.width = 0;
        this.x = 0;
        this.padding = 10;
        this.position = StaveModifierPosition.ABOVE;
    }
    getPosition() {
        return this.position;
    }
    setPosition(position) {
        this.position = position;
        return this;
    }
    getStave() {
        return this.stave;
    }
    checkStave() {
        return defined(this.stave, 'NoStave', 'No stave attached to instance.');
    }
    setStave(stave) {
        this.stave = stave;
        return this;
    }
    getWidth() {
        return this.width;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
        return this;
    }
    placeGlyphOnLine(glyph, stave, line, customShift = 0) {
        glyph.setYShift(stave.getYForLine(line !== null && line !== void 0 ? line : 0) - stave.getYForGlyphs() + customShift);
    }
    getPadding(index) {
        return index !== undefined && index < 2 ? 0 : this.padding;
    }
    setPadding(padding) {
        this.padding = padding;
        return this;
    }
    setLayoutMetrics(layoutMetrics) {
        this.layoutMetrics = layoutMetrics;
        return this;
    }
    getLayoutMetrics() {
        return this.layoutMetrics;
    }
    draw(...args) {
    }
}
