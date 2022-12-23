import { BoundingBox } from './boundingbox';
import { Element } from './element';
import { Font, FontGlyph } from './font';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
export interface GlyphProps {
    code_head: string;
    ledger_code_head?: string;
    dot_shiftY: number;
    position: string;
    rest: boolean;
    line_below: number;
    line_above: number;
    stem_beam_extension: number;
    stem_up_extension: number;
    stem_down_extension: number;
    stem: boolean;
    code?: string;
    code_flag_upstem?: string;
    code_flag_downstem?: string;
    flag?: boolean;
    width?: number;
    text?: string;
    tabnote_stem_down_extension: number;
    tabnote_stem_up_extension: number;
    beam_count: number;
    shift_y?: number;
    getWidth(a?: number): number;
}
export interface GlyphOptions {
    category?: string;
}
export interface GlyphMetrics {
    width: number;
    height: number;
    x_min: number;
    x_max: number;
    x_shift: number;
    y_shift: number;
    scale: number;
    ha: number;
    outline: number[];
    font: Font;
}
export declare const enum OutlineCode {
    MOVE = 0,
    LINE = 1,
    QUADRATIC = 2,
    BEZIER = 3
}
declare class GlyphCacheEntry {
    metrics: GlyphMetrics;
    bbox: BoundingBox;
    point: number;
    constructor(fontStack: Font[], code: string, category?: string);
}
declare class GlyphCache {
    protected cache: Map<string, Record<string, GlyphCacheEntry>>;
    lookup(code: string, category?: string): GlyphCacheEntry;
}
export declare class Glyph extends Element {
    static get CATEGORY(): string;
    protected static cache: GlyphCache;
    static CURRENT_CACHE_KEY: string;
    static MUSIC_FONT_STACK: Font[];
    /**
     * Pass a key of the form `glyphs.{category}.{code}.{key}` to Font.lookupMetric(). If the initial lookup fails,
     * try again with the path `glyphs.{category}.{key}`. If the second lookup fails, return the defaultValue.
     *
     * @param font
     * @param category any metric path under 'glyphs', so 'stem.up' could resolve to glyphs.stem.up.shiftX, glyphs.stem.up.shiftY, etc.
     * @param code
     * @param key
     * @param defaultValue
     */
    static lookupFontMetric(font: Font, category: string, code: string, key: string, defaultValue: number): number;
    static lookupGlyph(fontStack: Font[], code: string): {
        font: Font;
        glyph: FontGlyph;
    };
    static loadMetrics(fontStack: Font[], code: string, category?: string): GlyphMetrics;
    /**
     * Renders glyphs from the default font stack.
     *
     * @param ctx Canvas or SVG context
     * @param x_pos x coordinate
     * @param y_pos y coordinate
     * @param point the point size of the font
     * @param code the glyph code in font.getGlyphs()
     * @param options
     * @returns
     */
    static renderGlyph(ctx: RenderContext, x_pos: number, y_pos: number, point: number, code: string, options?: {
        category?: string;
        scale?: number;
    }): GlyphMetrics;
    static renderOutline(ctx: RenderContext, outline: number[], scale: number, x_pos: number, y_pos: number): void;
    static getOutlineBoundingBox(outline: number[], scale: number, x_pos: number, y_pos: number): BoundingBox;
    static getWidth(code: string, point: number, category?: string): number;
    bbox: BoundingBox;
    code: string;
    metrics: GlyphMetrics;
    topGlyphs: Glyph[];
    botGlyphs: Glyph[];
    protected options: GlyphOptions;
    protected originShift: {
        x: number;
        y: number;
    };
    protected x_shift: number;
    protected y_shift: number;
    scale: number;
    protected point: number;
    protected stave?: Stave;
    /**
     * @param code
     * @param point
     * @param options
     */
    constructor(code: string, point: number, options?: GlyphOptions);
    draw(...args: any[]): void;
    getCode(): string;
    setOptions(options: any): void;
    setPoint(point: number): this;
    setStave(stave: Stave): this;
    getXShift(): number;
    setXShift(x_shift: number): this;
    getYshift(): number;
    setYShift(y_shift: number): this;
    reset(): void;
    checkMetrics(): GlyphMetrics;
    getMetrics(): GlyphMetrics;
    setOriginX(x: number): void;
    setOriginY(y: number): void;
    setOrigin(x: number, y: number): void;
    render(ctx: RenderContext, x: number, y: number): void;
    checkStave(): Stave;
    renderToStave(x: number): void;
}
export {};
