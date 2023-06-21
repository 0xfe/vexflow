import { Element } from './element.js';
import { Tables } from './tables.js';
import { log, RuntimeError } from './util.js';
function L(...args) {
    if (Stem.DEBUG)
        log('Vex.Flow.Stem', args);
}
class Stem extends Element {
    static get CATEGORY() {
        return "Stem";
    }
    static get UP() {
        return 1;
    }
    static get DOWN() {
        return -1;
    }
    static get WIDTH() {
        return Tables.STEM_WIDTH;
    }
    static get HEIGHT() {
        return Tables.STEM_HEIGHT;
    }
    constructor(options) {
        super();
        this.stem_up_y_offset = 0;
        this.stem_down_y_offset = 0;
        this.stem_up_y_base_offset = 0;
        this.stem_down_y_base_offset = 0;
        this.x_begin = (options === null || options === void 0 ? void 0 : options.x_begin) || 0;
        this.x_end = (options === null || options === void 0 ? void 0 : options.x_end) || 0;
        this.y_top = (options === null || options === void 0 ? void 0 : options.y_top) || 0;
        this.y_bottom = (options === null || options === void 0 ? void 0 : options.y_bottom) || 0;
        this.stem_extension = (options === null || options === void 0 ? void 0 : options.stem_extension) || 0;
        this.stem_direction = (options === null || options === void 0 ? void 0 : options.stem_direction) || 0;
        this.hide = (options === null || options === void 0 ? void 0 : options.hide) || false;
        this.isStemlet = (options === null || options === void 0 ? void 0 : options.isStemlet) || false;
        this.stemletHeight = (options === null || options === void 0 ? void 0 : options.stemletHeight) || 0;
        this.renderHeightAdjustment = 0;
        this.setOptions(options);
    }
    setOptions(options) {
        this.stem_up_y_offset = (options === null || options === void 0 ? void 0 : options.stem_up_y_offset) || 0;
        this.stem_down_y_offset = (options === null || options === void 0 ? void 0 : options.stem_down_y_offset) || 0;
        this.stem_up_y_base_offset = (options === null || options === void 0 ? void 0 : options.stem_up_y_base_offset) || 0;
        this.stem_down_y_base_offset = (options === null || options === void 0 ? void 0 : options.stem_down_y_base_offset) || 0;
    }
    setNoteHeadXBounds(x_begin, x_end) {
        this.x_begin = x_begin;
        this.x_end = x_end;
        return this;
    }
    setDirection(direction) {
        this.stem_direction = direction;
    }
    setExtension(ext) {
        this.stem_extension = ext;
    }
    getExtension() {
        return this.stem_extension;
    }
    setYBounds(y_top, y_bottom) {
        this.y_top = y_top;
        this.y_bottom = y_bottom;
    }
    getHeight() {
        const y_offset = this.stem_direction === Stem.UP ? this.stem_up_y_offset : this.stem_down_y_offset;
        const unsigned_height = this.y_bottom - this.y_top + (Stem.HEIGHT - y_offset + this.stem_extension);
        return unsigned_height * this.stem_direction;
    }
    getBoundingBox() {
        throw new RuntimeError('NotImplemented', 'getBoundingBox() not implemented.');
    }
    getExtents() {
        const isStemUp = this.stem_direction === Stem.UP;
        const ys = [this.y_top, this.y_bottom];
        const stemHeight = Stem.HEIGHT + this.stem_extension;
        const innerMostNoteheadY = (isStemUp ? Math.min : Math.max)(...ys);
        const outerMostNoteheadY = (isStemUp ? Math.max : Math.min)(...ys);
        const stemTipY = innerMostNoteheadY + stemHeight * -this.stem_direction;
        return { topY: stemTipY, baseY: outerMostNoteheadY };
    }
    setVisibility(isVisible) {
        this.hide = !isVisible;
        return this;
    }
    setStemlet(isStemlet, stemletHeight) {
        this.isStemlet = isStemlet;
        this.stemletHeight = stemletHeight;
        return this;
    }
    adjustHeightForFlag() {
        this.renderHeightAdjustment = Tables.currentMusicFont().lookupMetric('stem.heightAdjustmentForFlag', -3);
    }
    adjustHeightForBeam() {
        this.renderHeightAdjustment = -Stem.WIDTH / 2;
    }
    draw() {
        this.setRendered();
        if (this.hide)
            return;
        const ctx = this.checkContext();
        let stem_x;
        let stem_y;
        const stem_direction = this.stem_direction;
        let y_base_offset = 0;
        if (stem_direction === Stem.DOWN) {
            stem_x = this.x_begin;
            stem_y = this.y_top + this.stem_down_y_offset;
            y_base_offset = this.stem_down_y_base_offset;
        }
        else {
            stem_x = this.x_end;
            stem_y = this.y_bottom - this.stem_up_y_offset;
            y_base_offset = this.stem_up_y_base_offset;
        }
        const stemHeight = this.getHeight();
        L('Rendering stem - ', 'Top Y: ', this.y_top, 'Bottom Y: ', this.y_bottom);
        const stemletYOffset = this.isStemlet ? stemHeight - this.stemletHeight * this.stem_direction : 0;
        ctx.save();
        this.applyStyle();
        ctx.openGroup('stem', this.getAttribute('id'), { pointerBBox: true });
        ctx.beginPath();
        ctx.setLineWidth(Stem.WIDTH);
        ctx.moveTo(stem_x, stem_y - stemletYOffset + y_base_offset);
        ctx.lineTo(stem_x, stem_y - stemHeight - this.renderHeightAdjustment * stem_direction);
        ctx.stroke();
        ctx.closeGroup();
        this.restoreStyle();
        ctx.restore();
    }
}
Stem.DEBUG = false;
export { Stem };
