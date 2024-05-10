import { FontInfo } from './font';
export interface TextMeasure {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface GroupAttributes {
    pointerBBox: boolean;
}
export declare abstract class RenderContext {
    static get CATEGORY(): string;
    abstract clear(): void;
    abstract setFillStyle(style: string): this;
    abstract setBackgroundFillStyle(style: string): this;
    abstract setStrokeStyle(style: string): this;
    abstract setShadowColor(color: string): this;
    abstract setShadowBlur(blur: number): this;
    abstract setLineWidth(width: number): this;
    abstract setLineCap(capType: CanvasLineCap): this;
    abstract setLineDash(dashPattern: number[]): this;
    abstract scale(x: number, y: number): this;
    abstract rect(x: number, y: number, width: number, height: number): this;
    abstract resize(width: number, height: number): this;
    abstract fillRect(x: number, y: number, width: number, height: number): this;
    abstract clearRect(x: number, y: number, width: number, height: number): this;
    abstract beginPath(): this;
    abstract moveTo(x: number, y: number): this;
    abstract lineTo(x: number, y: number): this;
    abstract bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): this;
    abstract quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
    abstract arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise: boolean): this;
    abstract fill(attributes?: any): this;
    abstract stroke(): this;
    abstract closePath(): this;
    abstract fillText(text: string, x: number, y: number): this;
    abstract save(): this;
    abstract restore(): this;
    abstract openGroup(cls?: string, id?: string, attrs?: GroupAttributes): any;
    abstract closeGroup(): void;
    abstract add(child: any): void;
    abstract measureText(text: string): TextMeasure;
    abstract set fillStyle(style: string | CanvasGradient | CanvasPattern);
    abstract get fillStyle(): string | CanvasGradient | CanvasPattern;
    abstract set strokeStyle(style: string | CanvasGradient | CanvasPattern);
    abstract get strokeStyle(): string | CanvasGradient | CanvasPattern;
    abstract setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this;
    abstract getFont(): string;
    set font(f: string);
    get font(): string;
    /**
     * This is kept for backwards compatibility with 3.0.9.
     * @deprecated use `setFont(...)` instead since it now supports CSS font shorthand.
     */
    setRawFont(f: string): this;
}
/**
 * Draw a tiny dot marker on the specified context. A great debugging aid.
 * @param ctx context
 * @param x dot x coordinate
 * @param y dot y coordinate
 * @param color
 */
export declare function drawDot(ctx: RenderContext, x: number, y: number, color?: string): void;
