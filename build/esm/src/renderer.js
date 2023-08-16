import { CanvasContext } from './canvascontext.js';
import { SVGContext } from './svgcontext.js';
import { isRenderContext } from './typeguard.js';
import { RuntimeError } from './util.js';
import { isHTMLCanvas, isHTMLDiv } from './web.js';
export var RendererBackends;
(function (RendererBackends) {
    RendererBackends[RendererBackends["CANVAS"] = 1] = "CANVAS";
    RendererBackends[RendererBackends["SVG"] = 2] = "SVG";
})(RendererBackends || (RendererBackends = {}));
export var RendererLineEndType;
(function (RendererLineEndType) {
    RendererLineEndType[RendererLineEndType["NONE"] = 1] = "NONE";
    RendererLineEndType[RendererLineEndType["UP"] = 2] = "UP";
    RendererLineEndType[RendererLineEndType["DOWN"] = 3] = "DOWN";
})(RendererLineEndType || (RendererLineEndType = {}));
class Renderer {
    static buildContext(elementId, backend, width, height, background = '#FFF') {
        const renderer = new Renderer(elementId, backend);
        if (width && height) {
            renderer.resize(width, height);
        }
        const ctx = renderer.getContext();
        ctx.setBackgroundFillStyle(background);
        Renderer.lastContext = ctx;
        return ctx;
    }
    static getCanvasContext(elementId, width, height, background) {
        return Renderer.buildContext(elementId, Renderer.Backends.CANVAS, width, height, background);
    }
    static getSVGContext(elementId, width, height, background) {
        return Renderer.buildContext(elementId, Renderer.Backends.SVG, width, height, background);
    }
    static drawDashedLine(context, fromX, fromY, toX, toY, dashPattern) {
        context.beginPath();
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        let x = fromX;
        let y = fromY;
        context.moveTo(fromX, fromY);
        let idx = 0;
        let draw = true;
        while (!((dx < 0 ? x <= toX : x >= toX) && (dy < 0 ? y <= toY : y >= toY))) {
            const dashLength = dashPattern[idx++ % dashPattern.length];
            const nx = x + Math.cos(angle) * dashLength;
            x = dx < 0 ? Math.max(toX, nx) : Math.min(toX, nx);
            const ny = y + Math.sin(angle) * dashLength;
            y = dy < 0 ? Math.max(toY, ny) : Math.min(toY, ny);
            if (draw) {
                context.lineTo(x, y);
            }
            else {
                context.moveTo(x, y);
            }
            draw = !draw;
        }
        context.closePath();
        context.stroke();
    }
    constructor(arg0, arg1) {
        if (isRenderContext(arg0)) {
            this.ctx = arg0;
        }
        else {
            if (arg1 === undefined) {
                throw new RuntimeError('InvalidArgument', 'Missing backend argument');
            }
            const backend = arg1;
            let element;
            if (typeof arg0 == 'string') {
                const maybeElement = document.getElementById(arg0);
                if (!maybeElement) {
                    throw new RuntimeError('BadElementId', `Can't find element with ID "${maybeElement}"`);
                }
                element = maybeElement;
            }
            else {
                element = arg0;
            }
            if (backend === Renderer.Backends.CANVAS) {
                if (!isHTMLCanvas(element)) {
                    throw new RuntimeError('BadElement', 'CANVAS context requires an HTMLCanvasElement.');
                }
                const context = element.getContext('2d', { willReadFrequently: true });
                if (!context) {
                    throw new RuntimeError('BadElement', "Can't get canvas context");
                }
                this.ctx = new CanvasContext(context);
            }
            else if (backend === Renderer.Backends.SVG) {
                if (!isHTMLDiv(element)) {
                    throw new RuntimeError('BadElement', 'SVG context requires an HTMLDivElement.');
                }
                this.ctx = new SVGContext(element);
            }
            else {
                throw new RuntimeError('InvalidBackend', `No support for backend: ${backend}`);
            }
        }
    }
    resize(width, height) {
        this.ctx.resize(width, height);
        return this;
    }
    getContext() {
        return this.ctx;
    }
}
Renderer.Backends = RendererBackends;
Renderer.LineEndType = RendererLineEndType;
Renderer.lastContext = undefined;
export { Renderer };
