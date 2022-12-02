import { FontGlyph, FontInfo } from './font';
export interface TextFormatterInfo extends Record<string, unknown> {
    family: string;
    resolution?: number;
    glyphs?: Record<string, FontGlyph>;
    serifs: boolean;
    monospaced: boolean;
    italic: boolean;
    bold: boolean;
    maxSizeGlyph?: string;
    superscriptOffset?: number;
    subscriptOffset?: number;
    description: string;
}
/**
 * Y information, 0 is baseline, yMin is lowest point.
 */
export interface yExtent {
    yMin: number;
    yMax: number;
    height: number;
}
export declare class TextFormatter {
    /** To enable logging for this class. Set `Vex.Flow.TextFormatter.DEBUG` to `true`. */
    static DEBUG: boolean;
    /**
     * Return all registered font families.
     */
    static getFontFamilies(): TextFormatterInfo[];
    /**
     * Call `TextFormatter.registerInfo(info)` to register font information before using this method.
     *
     * This method creates a formatter for the font that most closely matches the requested font.
     * We compare font family, bold, and italic attributes.
     * This method will return a fallback formatter if there are no matches.
     */
    static create(requestedFont?: FontInfo): TextFormatter;
    /**
     * @param fontFamily used as a key to the font registry.
     * @returns the same info object that was passed in via `TextFormatter.registerInfo(info)`
     */
    static getInfo(fontFamily: string): TextFormatterInfo | undefined;
    /**
     * Apps may register their own fonts and metrics, and those metrics
     * will be available to the app for formatting.
     *
     * Metrics can be generated from a font file using fontgen_text.js in the tools/fonts directory.
     * @param info
     * @param overwrite
     */
    static registerInfo(info: TextFormatterInfo, overwrite?: boolean): void;
    /** Font family. */
    protected family: string;
    /** Specified in `pt` units. */
    protected size: number;
    /** Font metrics are extracted at 1000 upem (units per em). */
    protected resolution: number;
    /**
     * For text formatting, we do not require glyph outlines, but instead rely on glyph
     * bounding box metrics such as:
     * ```
     * {
     *    x_min: 48,
     *    x_max: 235,
     *    y_min: -17,
     *    y_max: 734,
     *    ha: 751,
     *    leftSideBearing: 48,
     *    advanceWidth: 286,
     *  }
     * ```
     */
    protected glyphs: Record<string, FontGlyph>;
    protected description?: string;
    protected serifs: boolean;
    protected monospaced: boolean;
    protected italic: boolean;
    protected bold: boolean;
    protected superscriptOffset: number;
    protected subscriptOffset: number;
    protected maxSizeGlyph: string;
    protected cacheKey: string;
    /**
     * Use `TextFormatter.create(...)` to build an instance from information previously
     * registered via `TextFormatter.registerInfo(info)`.
     */
    private constructor();
    get localHeightCache(): Record<string, yExtent | undefined>;
    updateParams(params: TextFormatterInfo): void;
    /** Create a hash with the current font data, so we can cache computed widths. */
    updateCacheKey(): void;
    /**
     * The glyphs table is indexed by the character (e.g., 'C', '@').
     * See: robotoslab_glyphs.ts & petalumascript_glyphs.ts.
     */
    getGlyphMetrics(character: string): FontGlyph;
    get maxHeight(): number;
    /**
     * Retrieve the character's advanceWidth as a fraction of an `em` unit.
     * For the space character ' ' as defined in the:
     *   petalumascript_glyphs.ts: 250 advanceWidth in the 1000 unitsPerEm font returns 0.25.
     *   robotoslab_glyphs.ts:     509 advanceWidth in the 2048 unitsPerEm font returns 0.2485.
     */
    getWidthForCharacterInEm(c: string): number;
    /**
     * Retrieve the character's y bounds (ymin, ymax) and height.
     */
    getYForCharacterInPx(c: string): yExtent;
    getYForStringInPx(str: string): yExtent;
    /**
     * Retrieve the total width of `text` in `em` units.
     */
    getWidthForTextInEm(text: string): number;
    /** The width of the text (in `em`) is scaled by the font size (in `px`). */
    getWidthForTextInPx(text: string): number;
    /**
     * @param size in pt.
     */
    setFontSize(size: number): this;
    /** `this.size` is specified in points. Convert to pixels. */
    get fontSizeInPixels(): number;
    getResolution(): number;
}
