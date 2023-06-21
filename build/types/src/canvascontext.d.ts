import { FontInfo } from './font';
import { GroupAttributes, RenderContext, TextMeasure } from './rendercontext';
interface OffscreenCanvas extends EventTarget {
    width: number;
    height: number;
}
interface OffscreenCanvasRenderingContext2D extends CanvasState, CanvasTransform, CanvasCompositing, CanvasImageSmoothing, CanvasFillStrokeStyles, CanvasShadowStyles, CanvasFilters, CanvasRect, CanvasDrawPath, CanvasText, CanvasDrawImage, CanvasImageData, CanvasPathDrawingStyles, CanvasTextDrawingStyles, CanvasPath {
    readonly canvas: OffscreenCanvas;
}
/**
 * A rendering context for the Canvas backend. This class serves as a proxy for the
 * underlying CanvasRenderingContext2D object, part of the browser's API.
 */
export declare class CanvasContext extends RenderContext {
    /**  The 2D rendering context from the Canvas API. Forward method calls to this object. */
    context2D: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    /**
     * The HTMLCanvasElement or OffscreenCanvas that is associated with the above context.
     * If there was no associated `<canvas>` element, just store the default WIDTH / HEIGHT.
     */
    canvas: HTMLCanvasElement | OffscreenCanvas | {
        width: number;
        height: number;
    };
    /** Height of one line of text (in pixels). */
    textHeight: number;
    static get WIDTH(): number;
    static get HEIGHT(): number;
    static get CANVAS_BROWSER_SIZE_LIMIT(): number;
    /**
     * Ensure that width and height do not exceed the browser limit.
     * @returns array of [width, height] clamped to the browser limit.
     */
    static sanitizeCanvasDims(width: number, height: number): [number, number];
    constructor(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D);
    /**
     * Set all pixels to transparent black rgba(0,0,0,0).
     */
    clear(): void;
    openGroup(cls?: string, id?: string, attrs?: GroupAttributes): any;
    closeGroup(): void;
    add(child: any): void;
    setFillStyle(style: string): this;
    /** CanvasContext ignores `setBackgroundFillStyle()`. */
    setBackgroundFillStyle(style: string): this;
    setStrokeStyle(style: string): this;
    setShadowColor(color: string): this;
    setShadowBlur(blur: number): this;
    setLineWidth(width: number): this;
    setLineCap(capType: CanvasLineCap): this;
    setLineDash(dash: number[]): this;
    scale(x: number, y: number): this;
    resize(width: number, height: number, devicePixelRatio?: number): this;
    rect(x: number, y: number, width: number, height: number): this;
    fillRect(x: number, y: number, width: number, height: number): this;
    /**
     * Set the pixels in a rectangular area to transparent black rgba(0,0,0,0).
     */
    clearRect(x: number, y: number, width: number, height: number): this;
    beginPath(): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this;
    fill(): this;
    stroke(): this;
    closePath(): this;
    measureText(text: string): TextMeasure;
    fillText(text: string, x: number, y: number): this;
    save(): this;
    restore(): this;
    set fillStyle(style: string | CanvasGradient | CanvasPattern);
    get fillStyle(): string | CanvasGradient | CanvasPattern;
    set strokeStyle(style: string | CanvasGradient | CanvasPattern);
    get strokeStyle(): string | CanvasGradient | CanvasPattern;
    /**
     * @param f is 1) a `FontInfo` object or
     *             2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
     *             3) a string representing the font family (one of `size`, `weight`, or `style` must also be provided).
     * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
     * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
     * @param style is a string (e.g., 'italic', 'normal').
     */
    setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this;
    /** Return a string of the form `'italic bold 15pt Arial'` */
    getFont(): string;
}
export {};
