import { Font } from './font.js';
import { RenderContext } from './rendercontext.js';
import { globalObject, warn } from './util.js';
import { isHTMLCanvas } from './web.js';
export class CanvasContext extends RenderContext {
    static get WIDTH() {
        return 600;
    }
    static get HEIGHT() {
        return 400;
    }
    static get CANVAS_BROWSER_SIZE_LIMIT() {
        return 32767;
    }
    static sanitizeCanvasDims(width, height) {
        const limit = this.CANVAS_BROWSER_SIZE_LIMIT;
        if (Math.max(width, height) > limit) {
            warn('Canvas dimensions exceed browser limit. Cropping to ' + limit);
            if (width > limit) {
                width = limit;
            }
            if (height > limit) {
                height = limit;
            }
        }
        return [width, height];
    }
    constructor(context) {
        super();
        this.textHeight = 0;
        this.context2D = context;
        if (!context.canvas) {
            this.canvas = {
                width: CanvasContext.WIDTH,
                height: CanvasContext.HEIGHT,
            };
        }
        else {
            this.canvas = context.canvas;
        }
    }
    clear() {
        this.context2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    openGroup(cls, id, attrs) {
    }
    closeGroup() {
    }
    add(child) {
    }
    setFillStyle(style) {
        this.context2D.fillStyle = style;
        return this;
    }
    setBackgroundFillStyle(style) {
        return this;
    }
    setStrokeStyle(style) {
        this.context2D.strokeStyle = style;
        return this;
    }
    setShadowColor(color) {
        this.context2D.shadowColor = color;
        return this;
    }
    setShadowBlur(blur) {
        const t = this.context2D.getTransform();
        const scale = Math.sqrt(t.a * t.a + t.b * t.b + t.c * t.c + t.d * t.d);
        this.context2D.shadowBlur = scale * blur;
        return this;
    }
    setLineWidth(width) {
        this.context2D.lineWidth = width;
        return this;
    }
    setLineCap(capType) {
        this.context2D.lineCap = capType;
        return this;
    }
    setLineDash(dash) {
        this.context2D.setLineDash(dash);
        return this;
    }
    scale(x, y) {
        this.context2D.scale(x, y);
        return this;
    }
    resize(width, height, devicePixelRatio) {
        var _a;
        const canvas = this.context2D.canvas;
        const dpr = (_a = devicePixelRatio !== null && devicePixelRatio !== void 0 ? devicePixelRatio : globalObject().devicePixelRatio) !== null && _a !== void 0 ? _a : 1;
        [width, height] = CanvasContext.sanitizeCanvasDims(width * dpr, height * dpr);
        width = (width / dpr) | 0;
        height = (height / dpr) | 0;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        if (isHTMLCanvas(canvas)) {
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
        }
        return this.scale(dpr, dpr);
    }
    rect(x, y, width, height) {
        this.context2D.rect(x, y, width, height);
        return this;
    }
    fillRect(x, y, width, height) {
        this.context2D.fillRect(x, y, width, height);
        return this;
    }
    clearRect(x, y, width, height) {
        this.context2D.clearRect(x, y, width, height);
        return this;
    }
    beginPath() {
        this.context2D.beginPath();
        return this;
    }
    moveTo(x, y) {
        this.context2D.moveTo(x, y);
        return this;
    }
    lineTo(x, y) {
        this.context2D.lineTo(x, y);
        return this;
    }
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        this.context2D.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        return this;
    }
    quadraticCurveTo(cpx, cpy, x, y) {
        this.context2D.quadraticCurveTo(cpx, cpy, x, y);
        return this;
    }
    arc(x, y, radius, startAngle, endAngle, counterclockwise) {
        this.context2D.arc(x, y, radius, startAngle, endAngle, counterclockwise);
        return this;
    }
    fill() {
        this.context2D.fill();
        return this;
    }
    stroke() {
        this.context2D.stroke();
        return this;
    }
    closePath() {
        this.context2D.closePath();
        return this;
    }
    measureText(text) {
        const metrics = this.context2D.measureText(text);
        let y = 0;
        let height = 0;
        if (metrics.fontBoundingBoxAscent) {
            y = -metrics.fontBoundingBoxAscent;
            height = metrics.fontBoundingBoxDescent + metrics.fontBoundingBoxAscent;
        }
        else {
            y = -metrics.actualBoundingBoxAscent;
            height = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent;
        }
        return {
            x: 0,
            y: y,
            width: metrics.width,
            height: height,
        };
    }
    fillText(text, x, y) {
        this.context2D.fillText(text, x, y);
        return this;
    }
    save() {
        this.context2D.save();
        return this;
    }
    restore() {
        this.context2D.restore();
        return this;
    }
    set fillStyle(style) {
        this.context2D.fillStyle = style;
    }
    get fillStyle() {
        return this.context2D.fillStyle;
    }
    set strokeStyle(style) {
        this.context2D.strokeStyle = style;
    }
    get strokeStyle() {
        return this.context2D.strokeStyle;
    }
    setFont(f, size, weight, style) {
        const fontInfo = Font.validate(f, size, weight, style);
        this.context2D.font = Font.toCSSString(fontInfo);
        this.textHeight = Font.convertSizeToPixelValue(fontInfo.size);
        return this;
    }
    getFont() {
        return this.context2D.font;
    }
}
