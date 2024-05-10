import { FontInfo } from './font';
import { Glyph } from './glyph';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { TextFormatter } from './textformatter';
export interface ChordSymbolBlock {
    text: string;
    symbolType: SymbolTypes;
    symbolModifier: SymbolModifiers;
    xShift: number;
    yShift: number;
    vAlign: boolean;
    width: number;
    glyph?: Glyph;
}
export interface ChordSymbolGlyphMetrics {
    leftSideBearing: number;
    advanceWidth: number;
    yOffset: number;
}
export interface ChordSymbolMetrics {
    global: {
        superscriptOffset: number;
        subscriptOffset: number;
        kerningOffset: number;
        lowerKerningText: string[];
        upperKerningText: string[];
        spacing: number;
        superSubRatio: number;
    };
    glyphs: Record<string, ChordSymbolGlyphMetrics>;
}
export declare enum ChordSymbolHorizontalJustify {
    LEFT = 1,
    CENTER = 2,
    RIGHT = 3,
    CENTER_STEM = 4
}
export declare enum ChordSymbolVerticalJustify {
    TOP = 1,
    BOTTOM = 2
}
export declare enum SymbolTypes {
    GLYPH = 1,
    TEXT = 2,
    LINE = 3
}
export declare enum SymbolModifiers {
    NONE = 1,
    SUBSCRIPT = 2,
    SUPERSCRIPT = 3
}
/**
 * ChordSymbol is a modifier that creates a chord symbol above/below a chord.
 * As a modifier, it is attached to an existing note.
 */
export declare class ChordSymbol extends Modifier {
    static DEBUG: boolean;
    static get CATEGORY(): string;
    static readonly HorizontalJustify: typeof ChordSymbolHorizontalJustify;
    static readonly HorizontalJustifyString: Record<string, ChordSymbolHorizontalJustify>;
    static readonly VerticalJustify: typeof ChordSymbolVerticalJustify;
    static readonly VerticalJustifyString: Record<string, ChordSymbolVerticalJustify>;
    static get superSubRatio(): number;
    /** Currently unused: Globally turn off text formatting, if the built-in formatting does not work for your font. */
    static set NO_TEXT_FORMAT(val: boolean);
    static get NO_TEXT_FORMAT(): boolean;
    static getMetricForGlyph(glyphCode: string): ChordSymbolGlyphMetrics | undefined;
    static get engravingFontResolution(): number;
    static get spacingBetweenBlocks(): number;
    static getWidthForGlyph(glyph: Glyph): number;
    static getYShiftForGlyph(glyph: Glyph): number;
    static getXShiftForGlyph(glyph: Glyph): number;
    static get superscriptOffset(): number;
    static get subscriptOffset(): number;
    static get kerningOffset(): number;
    static readonly glyphs: Record<string, {
        code: string;
    }>;
    static readonly symbolTypes: typeof SymbolTypes;
    static readonly symbolModifiers: typeof SymbolModifiers;
    static get metrics(): ChordSymbolMetrics;
    static get lowerKerningText(): string[];
    static get upperKerningText(): string[];
    static isSuperscript(block: ChordSymbolBlock): boolean;
    static isSubscript(block: ChordSymbolBlock): boolean;
    static get minPadding(): number;
    /**
     * Estimate the width of the whole chord symbol, based on the sum of the widths of the individual blocks.
     * Estimate how many lines above/below the staff we need.
     */
    static format(symbols: ChordSymbol[], state: ModifierContextState): boolean;
    /** Currently unused. */
    protected static noFormat: boolean;
    protected symbolBlocks: ChordSymbolBlock[];
    protected horizontal: number;
    protected vertical: number;
    protected useKerning: boolean;
    protected reportWidth: boolean;
    protected textFormatter: TextFormatter;
    constructor();
    /**
     * Default text font.
     * Choose a font family that works well with the current music engraving font.
     * @override `Element.TEXT_FONT`.
     */
    static get TEXT_FONT(): Required<FontInfo>;
    /**
     * The offset is specified in `em`. Scale this value by the font size in pixels.
     */
    get superscriptOffset(): number;
    get subscriptOffset(): number;
    setReportWidth(value: boolean): this;
    getReportWidth(): boolean;
    updateOverBarAdjustments(): void;
    updateKerningAdjustments(): void;
    /** Do some basic kerning so that letter chords like 'A' don't have the extensions hanging off to the right. */
    getKerningAdjustment(j: number): number;
    /**
     * ChordSymbol allows multiple blocks so we can mix glyphs and font text.
     * Each block can have its own vertical orientation.
     */
    getSymbolBlock(params?: any): ChordSymbolBlock;
    /** Add a symbol to this chord, could be text, glyph or line. */
    addSymbolBlock(parameters: any): this;
    /** Add a text block. */
    addText(text: string, parameters?: any): this;
    /** Add a text block with superscript modifier. */
    addTextSuperscript(text: string): this;
    /** Add a text block with subscript modifier. */
    addTextSubscript(text: string): this;
    /** Add a glyph block with superscript modifier. */
    addGlyphSuperscript(glyph: string): this;
    /** Add a glyph block. */
    addGlyph(glyph: string, params?: any): this;
    /**
     * Add a glyph for each character in 'text'. If the glyph is not available, use text from the font.
     * e.g. `addGlyphOrText('(+5#11)')` will use text for the '5' and '11', and glyphs for everything else.
     */
    addGlyphOrText(text: string, params?: any): this;
    /** Add a line of the given width, used as a continuation of the previous symbol in analysis, or lyrics, etc. */
    addLine(width: number, params?: any): this;
    /**
     * Set the chord symbol's font family, size, weight, style (e.g., `Arial`, `10pt`, `bold`, `italic`).
     *
     * @param f is 1) a `FontInfo` object or
     *             2) a string formatted as CSS font shorthand (e.g., 'bold 10pt Arial') or
     *             3) a string representing the font family (one of `size`, `weight`, or `style` must also be provided).
     * @param size a string specifying the font size and unit (e.g., '16pt'), or a number (the unit is assumed to be 'pt').
     * @param weight is a string (e.g., 'bold', 'normal') or a number (100, 200, ... 900).
     * @param style is a string (e.g., 'italic', 'normal').
     *
     * @override See: Element.
     */
    setFont(f?: string | FontInfo, size?: string | number, weight?: string | number, style?: string): this;
    setEnableKerning(val: boolean): this;
    /** Set vertical position of text (above or below stave). */
    setVertical(vj: ChordSymbolVerticalJustify | string | number): this;
    getVertical(): number;
    /** Set horizontal justification. */
    setHorizontal(hj: ChordSymbolHorizontalJustify | string | number): this;
    getHorizontal(): number;
    getWidth(): number;
    getYOffsetForText(text: string): number;
    /** Render text and glyphs above/below the note. */
    draw(): void;
}
