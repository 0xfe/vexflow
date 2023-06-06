import { FontInfo } from './font';
import { GroupAttributes, RenderContext, TextMeasure } from './rendercontext';
export type Attributes = {
    [name: string]: string | number | undefined;
    'font-family'?: string;
    'font-size'?: string | number;
    'font-style'?: string;
    'font-weight'?: string | number;
    scaleX?: number;
    scaleY?: number;
};
export interface State {
    state: Attributes;
    attributes: Attributes;
    shadow_attributes: Attributes;
    lineWidth: number;
}
declare class MeasureTextCache {
    protected txt?: SVGTextElement;
    protected cache: Record<string, Record<string, TextMeasure>>;
    lookup(text: string, svg: SVGSVGElement, attributes: Attributes): TextMeasure;
    measureImpl(text: string, svg: SVGSVGElement, attributes: Attributes): TextMeasure;
}
/**
 * SVG rendering context with an API similar to CanvasRenderingContext2D.
 */
export declare class SVGContext extends RenderContext {
    protected static measureTextCache: MeasureTextCache;
    element: HTMLElement;
    svg: SVGSVGElement;
    width: number;
    height: number;
    path: string;
    pen: {
        x: number;
        y: number;
    };
    lineWidth: number;
    attributes: Attributes;
    shadow_attributes: Attributes;
    state: Attributes;
    state_stack: State[];
    parent: SVGGElement;
    groups: SVGGElement[];
    protected groupAttributes: Attributes[];
    protected precision: number;
    backgroundFillStyle: string;
    /** Formatted as CSS font shorthand (e.g., 'italic bold 12pt Arial') */
    protected fontCSSString: string;
    constructor(element: HTMLElement);
    protected round(n: number): number;
    /**
     * Use one of the overload signatures to create an SVG element of a specific type.
     * The last overload accepts an arbitrary string, and is identical to the
     * implementation signature.
     * Feel free to add new overloads for other SVG element types as required.
     */
    create(svgElementType: 'g'): SVGGElement;
    create(svgElementType: 'path'): SVGPathElement;
    create(svgElementType: 'rect'): SVGRectElement;
    create(svgElementType: 'svg'): SVGSVGElement;
    create(svgElementType: 'text'): SVGTextElement;
    create(svgElementType: string): SVGElement;
    openGroup(cls?: string, id?: string, attrs?: GroupAttributes): SVGGElement;
    closeGroup(): void;
    add(elem: SVGElement): void;
    setFillStyle(style: string): this;
    /**
     * Used to set the fill color for `clearRect()`. This allows us to simulate
     * cutting a "hole" into the SVG drawing.
     */
    setBackgroundFillStyle(style: string): this;
    setStrokeStyle(style: string): this;
    setShadowColor(color: string): this;
    /**
     * @param blur A non-negative float specifying the level of shadow blur, where 0
     *             represents no blur and larger numbers represent increasingly more blur.
     * @returns this
     */
    setShadowBlur(blur: number): this;
    /**
     * @param width
     * @returns this
     */
    setLineWidth(width: number): this;
    /**
     * @param lineDash an array of integers in the form of [dash, space, dash, space, etc...]
     * @returns this
     *
     * See: [SVG `stroke-dasharray` attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
     */
    setLineDash(lineDash: number[]): this;
    /**
     * @param capType
     * @returns this
     */
    setLineCap(capType: CanvasLineCap): this;
    resize(width: number, height: number): this;
    scale(x: number, y: number): this;
    /**
     * 1 arg: string in the "x y w h" format
     * 4 args: x:number, y:number, w:number, h:number
     */
    setViewBox(viewBox_or_minX: string | number, minY?: number, width?: number, height?: number): void;
    applyAttributes(element: SVGElement, attributes: Attributes): SVGElement;
    clear(): void;
    rect(x: number, y: number, width: number, height: number, attributes?: Attributes): this;
    fillRect(x: number, y: number, width: number, height: number): this;
    clearRect(x: number, y: number, width: number, height: number): this;
    beginPath(): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this;
    quadraticCurveTo(x1: number, y1: number, x: number, y: number): this;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this;
    closePath(): this;
    private getShadowStyle;
    fill(attributes?: Attributes): this;
    stroke(): this;
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
     * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900). It is inserted
     *               into the font-weight attribute (e.g., font-weight="bold")
     * @param style is a string (e.g., 'italic', 'normal') that is inserted into the
     *              font-style attribute (e.g., font-style="italic")
     */
    setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this;
    /** Return a string of the form `'italic bold 15pt Arial'` */
    getFont(): string;
}
export {};
