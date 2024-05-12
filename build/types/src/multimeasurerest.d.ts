import { Element } from './element';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
export interface MultimeasureRestRenderOptions {
    /** Extracted by Factory.MultiMeasureRest() and passed to the MultiMeasureRest constructor. */
    number_of_measures: number;
    /** Use rest symbols. Defaults to `false`, which renders a thick horizontal line with serifs at both ends. */
    use_symbols?: boolean;
    /** Horizontal spacing between rest symbol glyphs (if `use_symbols` is `true`).*/
    symbol_spacing?: number;
    /** Show the number of measures at the top. Defaults to `true`. */
    show_number?: boolean;
    /** Vertical position of the "number of measures" text (measured in stave lines). Defaults to -0.5, which is above the stave. 6.5 is below the stave. */
    number_line?: number;
    /** Font size of the "number of measures" text. */
    number_glyph_point?: number;
    /** Left padding from `stave.getX()`. */
    padding_left?: number;
    /** Right padding from `stave.getX() + stave.getWidth()` */
    padding_right?: number;
    /** Vertical position of the rest line or symbols, expressed as stave lines. Default: 2. The top stave line is 1, and the bottom stave line is 5. */
    line?: number;
    /** Defaults to the number of vertical pixels between stave lines. Used for serif height or 2-bar / 4-bar symbol height. */
    spacing_between_lines_px?: number;
    /** Size of the semibreve (1-bar) rest symbol. Other symbols are scaled accordingly. */
    semibreve_rest_glyph_scale?: number;
    /** Thickness of the rest line. Used when `use_symbols` is false. Defaults to half the space between stave lines. */
    line_thickness?: number;
    /** Thickness of the rest line's serif. Used when `use_symbols` is false. */
    serif_thickness?: number;
}
export declare class MultiMeasureRest extends Element {
    static get CATEGORY(): string;
    render_options: Required<MultimeasureRestRenderOptions>;
    protected xs: {
        left: number;
        right: number;
    };
    protected number_of_measures: number;
    protected stave?: Stave;
    private hasPaddingLeft;
    private hasPaddingRight;
    private hasLineThickness;
    private hasSymbolSpacing;
    /**
     *
     * @param number_of_measures Number of measures.
     * @param options The options object.
     */
    constructor(number_of_measures: number, options: MultimeasureRestRenderOptions);
    getXs(): {
        left: number;
        right: number;
    };
    setStave(stave: Stave): this;
    getStave(): Stave | undefined;
    checkStave(): Stave;
    drawLine(stave: Stave, ctx: RenderContext, left: number, right: number, spacingBetweenLines: number): void;
    drawSymbols(stave: Stave, ctx: RenderContext, left: number, right: number, spacingBetweenLines: number): void;
    draw(): void;
}
