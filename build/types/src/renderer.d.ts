import { RenderContext } from './rendercontext';
export type ContextBuilder = typeof Renderer.getSVGContext | typeof Renderer.getCanvasContext;
export declare enum RendererBackends {
    CANVAS = 1,
    SVG = 2
}
export declare enum RendererLineEndType {
    NONE = 1,
    UP = 2,
    DOWN = 3
}
/**
 * Support Canvas & SVG rendering contexts.
 */
export declare class Renderer {
    static Backends: typeof RendererBackends;
    static LineEndType: typeof RendererLineEndType;
    static lastContext?: RenderContext;
    static buildContext(elementId: string | HTMLCanvasElement | HTMLDivElement, backend: number, width: number, height: number, background?: string): RenderContext;
    static getCanvasContext(elementId: string, width: number, height: number, background?: string): RenderContext;
    static getSVGContext(elementId: string, width: number, height: number, background?: string): RenderContext;
    static drawDashedLine(context: RenderContext, fromX: number, fromY: number, toX: number, toY: number, dashPattern: number[]): void;
    protected ctx: RenderContext;
    /**
     * @param canvasId can be:
     *   - a string element ID (of a canvas or div element)
     *   - a canvas element
     *   - a div element, which will contain the SVG output
     * @param backend Renderer.Backends.CANVAS or Renderer.Backends.SVG
     */
    constructor(context: RenderContext);
    constructor(canvas: string | HTMLCanvasElement | HTMLDivElement, backend: number);
    resize(width: number, height: number): this;
    getContext(): RenderContext;
}
