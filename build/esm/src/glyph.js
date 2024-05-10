import { BoundingBox } from './boundingbox.js';
import { BoundingBoxComputation } from './boundingboxcomputation.js';
import { Element } from './element.js';
import { Tables } from './tables.js';
import { defined, RuntimeError } from './util.js';
class GlyphCacheEntry {
    constructor(fontStack, code, category) {
        this.point = -1;
        this.metrics = Glyph.loadMetrics(fontStack, code, category);
        this.bbox = Glyph.getOutlineBoundingBox(this.metrics.outline, this.metrics.scale, this.metrics.x_shift, this.metrics.y_shift);
        if (category) {
            this.point = Glyph.lookupFontMetric(this.metrics.font, category, code, 'point', -1);
        }
    }
}
class GlyphCache {
    constructor() {
        this.cache = new Map();
    }
    lookup(code, category) {
        let entries = this.cache.get(Glyph.CURRENT_CACHE_KEY);
        if (entries === undefined) {
            entries = {};
            this.cache.set(Glyph.CURRENT_CACHE_KEY, entries);
        }
        const key = category ? `${code}%${category}` : code;
        let entry = entries[key];
        if (entry === undefined) {
            entry = new GlyphCacheEntry(Glyph.MUSIC_FONT_STACK, code, category);
            entries[key] = entry;
        }
        return entry;
    }
}
class GlyphOutline {
    constructor(outline, originX, originY, scale) {
        this.outline = outline;
        this.originX = originX;
        this.originY = originY;
        this.scale = scale;
        this.i = 0;
        this.precision = 1;
        this.precision = Math.pow(10, Tables.RENDER_PRECISION_PLACES);
    }
    done() {
        return this.i >= this.outline.length;
    }
    next() {
        return Math.round((this.outline[this.i++] * this.precision) / this.precision);
    }
    nextX() {
        return Math.round((this.originX + this.outline[this.i++] * this.scale) * this.precision) / this.precision;
    }
    nextY() {
        return Math.round((this.originY - this.outline[this.i++] * this.scale) * this.precision) / this.precision;
    }
    static parse(str) {
        const result = [];
        const parts = str.split(' ');
        let i = 0;
        while (i < parts.length) {
            switch (parts[i++]) {
                case 'm':
                    result.push(0, parseInt(parts[i++]), parseInt(parts[i++]));
                    break;
                case 'l':
                    result.push(1, parseInt(parts[i++]), parseInt(parts[i++]));
                    break;
                case 'q':
                    result.push(2, parseInt(parts[i++]), parseInt(parts[i++]), parseInt(parts[i++]), parseInt(parts[i++]));
                    break;
                case 'b':
                    result.push(3, parseInt(parts[i++]), parseInt(parts[i++]), parseInt(parts[i++]), parseInt(parts[i++]), parseInt(parts[i++]), parseInt(parts[i++]));
                    break;
            }
        }
        return result;
    }
}
class Glyph extends Element {
    static get CATEGORY() {
        return "Glyph";
    }
    static lookupFontMetric(font, category, code, key, defaultValue) {
        let value = font.lookupMetric(`glyphs.${category}.${code}.${key}`, undefined);
        if (value === undefined) {
            value = font.lookupMetric(`glyphs.${category}.${key}`, defaultValue);
        }
        return value;
    }
    static lookupGlyph(fontStack, code) {
        defined(fontStack, 'BadFontStack', 'Font stack is misconfigured');
        let glyph;
        let font;
        for (let i = 0; i < fontStack.length; i++) {
            font = fontStack[i];
            glyph = font.getGlyphs()[code];
            if (glyph)
                return { glyph, font };
        }
        throw new RuntimeError('BadGlyph', `Glyph ${code} does not exist in font.`);
    }
    static loadMetrics(fontStack, code, category) {
        const { glyph, font } = Glyph.lookupGlyph(fontStack, code);
        if (!glyph.o)
            throw new RuntimeError('BadGlyph', `Glyph ${code} has no outline defined.`);
        let x_shift = 0;
        let y_shift = 0;
        let scale = 1;
        if (category && font) {
            x_shift = Glyph.lookupFontMetric(font, category, code, 'shiftX', 0);
            y_shift = Glyph.lookupFontMetric(font, category, code, 'shiftY', 0);
            scale = Glyph.lookupFontMetric(font, category, code, 'scale', 1);
        }
        const x_min = glyph.x_min;
        const x_max = glyph.x_max;
        const ha = glyph.ha;
        if (!glyph.cached_outline) {
            glyph.cached_outline = GlyphOutline.parse(glyph.o);
        }
        return {
            x_min,
            x_max,
            x_shift,
            y_shift,
            scale,
            ha,
            outline: glyph.cached_outline,
            font,
            width: x_max - x_min,
            height: ha,
        };
    }
    static renderGlyph(ctx, x_pos, y_pos, point, code, options) {
        var _a;
        const data = Glyph.cache.lookup(code, options === null || options === void 0 ? void 0 : options.category);
        const metrics = data.metrics;
        if (data.point != -1) {
            point = data.point;
        }
        const customScale = (_a = options === null || options === void 0 ? void 0 : options.scale) !== null && _a !== void 0 ? _a : 1;
        const scale = ((point * 72.0) / (metrics.font.getResolution() * 100.0)) * metrics.scale * customScale;
        Glyph.renderOutline(ctx, metrics.outline, scale, x_pos + metrics.x_shift * customScale, y_pos + metrics.y_shift * customScale);
        return metrics;
    }
    static renderOutline(ctx, outline, scale, x_pos, y_pos) {
        const go = new GlyphOutline(outline, x_pos, y_pos, scale);
        ctx.beginPath();
        let x, y;
        while (!go.done()) {
            switch (go.next()) {
                case 0:
                    ctx.moveTo(go.nextX(), go.nextY());
                    break;
                case 1:
                    ctx.lineTo(go.nextX(), go.nextY());
                    break;
                case 2:
                    x = go.nextX();
                    y = go.nextY();
                    ctx.quadraticCurveTo(go.nextX(), go.nextY(), x, y);
                    break;
                case 3:
                    x = go.nextX();
                    y = go.nextY();
                    ctx.bezierCurveTo(go.nextX(), go.nextY(), go.nextX(), go.nextY(), x, y);
                    break;
            }
        }
        ctx.fill();
    }
    static getOutlineBoundingBox(outline, scale, x_pos, y_pos) {
        const go = new GlyphOutline(outline, x_pos, y_pos, scale);
        const bboxComp = new BoundingBoxComputation();
        let penX = x_pos;
        let penY = y_pos;
        let x, y;
        while (!go.done()) {
            switch (go.next()) {
                case 0:
                    penX = go.nextX();
                    penY = go.nextY();
                    break;
                case 1:
                    bboxComp.addPoint(penX, penY);
                    penX = go.nextX();
                    penY = go.nextY();
                    bboxComp.addPoint(penX, penY);
                    break;
                case 2:
                    x = go.nextX();
                    y = go.nextY();
                    bboxComp.addQuadraticCurve(penX, penY, go.nextX(), go.nextY(), x, y);
                    penX = x;
                    penY = y;
                    break;
                case 3:
                    x = go.nextX();
                    y = go.nextY();
                    bboxComp.addBezierCurve(penX, penY, go.nextX(), go.nextY(), go.nextX(), go.nextY(), x, y);
                    penX = x;
                    penY = y;
                    break;
            }
        }
        return new BoundingBox(bboxComp.getX1(), bboxComp.getY1(), bboxComp.width(), bboxComp.height());
    }
    static getWidth(code, point, category) {
        const data = Glyph.cache.lookup(code, category);
        if (data.point != -1) {
            point = data.point;
        }
        const scale = (point * 72) / (data.metrics.font.getResolution() * 100);
        return data.bbox.getW() * scale;
    }
    constructor(code, point, options) {
        super();
        this.bbox = new BoundingBox(0, 0, 0, 0);
        this.topGlyphs = [];
        this.botGlyphs = [];
        this.options = {};
        this.scale = 1;
        this.code = code;
        this.point = point;
        this.originShift = { x: 0, y: 0 };
        this.x_shift = 0;
        this.y_shift = 0;
        if (options) {
            this.setOptions(options);
        }
        else {
            this.reset();
        }
    }
    draw(...args) {
    }
    getCode() {
        return this.code;
    }
    setOptions(options) {
        this.options = Object.assign(Object.assign({}, this.options), options);
        this.reset();
    }
    setPoint(point) {
        this.point = point;
        return this;
    }
    setStave(stave) {
        this.stave = stave;
        return this;
    }
    getXShift() {
        return this.x_shift;
    }
    setXShift(x_shift) {
        this.x_shift = x_shift;
        return this;
    }
    getYshift() {
        return this.y_shift;
    }
    setYShift(y_shift) {
        this.y_shift = y_shift;
        return this;
    }
    reset() {
        const data = Glyph.cache.lookup(this.code, this.options.category);
        this.metrics = data.metrics;
        if (data.point != -1) {
            this.point = data.point;
        }
        this.scale = (this.point * 72) / (this.metrics.font.getResolution() * 100);
        this.bbox = new BoundingBox(data.bbox.getX() * this.scale, data.bbox.getY() * this.scale, data.bbox.getW() * this.scale, data.bbox.getH() * this.scale);
    }
    checkMetrics() {
        return defined(this.metrics, 'BadGlyph', `Glyph ${this.code} is not initialized.`);
    }
    getMetrics() {
        const metrics = this.checkMetrics();
        const metricsScale = metrics.scale;
        return {
            x_min: metrics.x_min * this.scale * metricsScale,
            x_max: metrics.x_max * this.scale * metricsScale,
            width: this.bbox.getW(),
            height: this.bbox.getH(),
            scale: this.scale * metricsScale,
            x_shift: metrics.x_shift,
            y_shift: metrics.y_shift,
            outline: metrics.outline,
            font: metrics.font,
            ha: metrics.ha,
        };
    }
    setOriginX(x) {
        const { bbox } = this;
        const originX = Math.abs(bbox.getX() / bbox.getW());
        const xShift = (x - originX) * bbox.getW();
        this.originShift.x = -xShift;
    }
    setOriginY(y) {
        const { bbox } = this;
        const originY = Math.abs(bbox.getY() / bbox.getH());
        const yShift = (y - originY) * bbox.getH();
        this.originShift.y = -yShift;
    }
    setOrigin(x, y) {
        this.setOriginX(x);
        this.setOriginY(y);
    }
    render(ctx, x, y) {
        const metrics = this.checkMetrics();
        const outline = metrics.outline;
        const scale = this.scale * metrics.scale;
        this.setRendered();
        this.applyStyle(ctx);
        const xPos = x + this.originShift.x + metrics.x_shift;
        const yPos = y + this.originShift.y + metrics.y_shift;
        Glyph.renderOutline(ctx, outline, scale, xPos, yPos);
        this.restoreStyle(ctx);
    }
    checkStave() {
        return defined(this.stave, 'NoStave', 'No stave attached to instance.');
    }
    renderToStave(x) {
        const context = this.checkContext();
        const metrics = this.checkMetrics();
        const stave = this.checkStave();
        const outline = metrics.outline;
        const scale = this.scale * metrics.scale;
        this.setRendered();
        this.applyStyle();
        const xPos = x + this.x_shift + metrics.x_shift;
        const yPos = stave.getYForGlyphs() + this.y_shift + metrics.y_shift;
        Glyph.renderOutline(context, outline, scale, xPos, yPos);
        this.restoreStyle();
    }
}
Glyph.cache = new GlyphCache();
Glyph.CURRENT_CACHE_KEY = '';
Glyph.MUSIC_FONT_STACK = [];
export { Glyph };
