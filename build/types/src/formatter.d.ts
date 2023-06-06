import { BoundingBox } from './boundingbox';
import { ModifierContext } from './modifiercontext';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
import { StemmableNote } from './stemmablenote';
import { TabNote } from './tabnote';
import { TabStave } from './tabstave';
import { Tickable } from './tickable';
import { TickContext } from './tickcontext';
import { Voice } from './voice';
export interface FormatterOptions {
    /** Defaults to Tables.SOFTMAX_FACTOR. */
    softmaxFactor?: number;
    /** Defaults to `false`. */
    globalSoftmax?: boolean;
    /** Defaults to 5. */
    maxIterations?: number;
}
export interface FormatParams {
    align_rests?: boolean;
    stave?: Stave;
    context?: RenderContext;
    auto_beam?: boolean;
}
export interface AlignmentContexts<T> {
    list: number[];
    map: Record<number, T>;
    array: T[];
    resolutionMultiplier: number;
}
export interface AlignmentModifierContexts {
    map: Map<Stave | undefined, Record<number, ModifierContext>>;
    array: ModifierContext[];
    resolutionMultiplier: number;
}
/**
 * Format implements the formatting and layout algorithms that are used
 * to position notes in a voice. The algorithm can align multiple voices both
 * within a stave, and across multiple staves.
 *
 * To do this, the formatter breaks up voices into a grid of rational-valued
 * `ticks`, to which each note is assigned. Then, minimum widths are assigned
 * to each tick based on the widths of the notes and modifiers in that tick. This
 * establishes the smallest amount of space required for each tick.
 *
 * Finally, the formatter distributes the left over space proportionally to
 * all the ticks, setting the `x` values of the notes in each tick.
 *
 * See `tests/formatter_tests.ts` for usage examples. The helper functions included
 * here (`FormatAndDraw`, `FormatAndDrawTab`) also serve as useful usage examples.
 */
export declare class Formatter {
    static DEBUG: boolean;
    protected hasMinTotalWidth: boolean;
    protected minTotalWidth: number;
    protected contextGaps: {
        total: number;
        gaps: {
            x1: number;
            x2: number;
        }[];
    };
    protected justifyWidth: number;
    protected totalCost: number;
    protected totalShift: number;
    protected tickContexts: AlignmentContexts<TickContext>;
    protected formatterOptions: Required<FormatterOptions>;
    protected modifierContexts: AlignmentModifierContexts[];
    protected voices: Voice[];
    protected lossHistory: number[];
    protected durationStats: Record<string, {
        mean: number;
        count: number;
    }>;
    /**
     * Helper function to layout "notes" one after the other without
     * regard for proportions. Useful for tests and debugging.
     */
    static SimpleFormat(notes: Tickable[], x?: number, { paddingBetween }?: {
        paddingBetween?: number | undefined;
    }): void;
    /** Helper function to plot formatter debug info. */
    static plotDebugging(ctx: RenderContext, formatter: Formatter, xPos: number, y1: number, y2: number, options?: {
        stavePadding: number;
    }): void;
    /**
     * Helper function to format and draw a single voice. Returns a bounding
     * box for the notation.
     * @param ctx  the rendering context
     * @param stave the stave to which to draw (`Stave` or `TabStave`)
     * @param notes array of `Note` instances (`Note`, `TextNote`, `TabNote`, etc.)
     * @param params one of below:
     *    * Setting `autobeam` only `(context, stave, notes, true)` or
     *      `(ctx, stave, notes, {autobeam: true})`
     *    * Setting `align_rests` a struct is needed `(context, stave, notes, {align_rests: true})`
     *    * Setting both a struct is needed `(context, stave, notes, {
     *      autobeam: true, align_rests: true})`
     *    * `autobeam` automatically generates beams for the notes.
     *    * `align_rests` aligns rests with nearby notes.
     */
    static FormatAndDraw(ctx: RenderContext, stave: Stave, notes: StemmableNote[], params?: FormatParams | boolean): BoundingBox | undefined;
    /**
     * Helper function to format and draw aligned tab and stave notes in two
     * separate staves.
     * @param ctx the rendering context
     * @param tabstave a `TabStave` instance on which to render `TabNote`s.
     * @param stave a `Stave` instance on which to render `Note`s.
     * @param notes array of `Note` instances for the stave (`Note`, `BarNote`, etc.)
     * @param tabnotes array of `Note` instances for the tab stave (`TabNote`, `BarNote`, etc.)
     * @param autobeam automatically generate beams.
     * @param params a configuration object:
     *    * `autobeam` automatically generates beams for the notes.
     *    * `align_rests` aligns rests with nearby notes.
     */
    static FormatAndDrawTab(ctx: RenderContext, tabstave: TabStave, stave: Stave, tabnotes: TabNote[], notes: Tickable[], autobeam: boolean, params: FormatParams): void;
    /**
     * Automatically set the vertical position of rests based on previous/next note positions.
     * @param tickables an array of Tickables.
     * @param alignAllNotes If `false`, only align rests that are within a group of beamed notes.
     * @param alignTuplets If `false`, ignores tuplets.
     */
    static AlignRestsToNotes(tickables: Tickable[], alignAllNotes: boolean, alignTuplets?: boolean): void;
    constructor(options?: FormatterOptions);
    /**
     * Find all the rests in each of the `voices` and align them to neighboring notes.
     *
     * @param voices
     * @param alignAllNotes If `false`, only align rests within beamed groups of notes. If `true`, align all rests.
     */
    alignRests(voices: Voice[], alignAllNotes: boolean): void;
    /**
     * Estimate the width required to render 'voices'.  This is done by:
     * 1. Sum the widths of all the tick contexts
     * 2. Estimate the padding.
     * The latter is done by calculating the padding 3 different ways, and taking the
     * greatest value:
     * 1. the padding required for unaligned notes in different voices
     * 2. the padding based on the stddev of the tickable widths
     * 3. the padding based on the stddev of the tickable durations.
     *
     * The last 2 quantities estimate a 'width entropy', where notes might need more
     * room than the proportional formatting gives them.  A measure of all same duration
     * and width will need no extra padding, and all these quantities will be
     * zero in that case.
     *
     * Note: joinVoices has to be called before calling preCalculateMinTotalWidth.
     *
     * @param voices the voices that contain the notes
     * @returns the estimated width in pixels
     */
    preCalculateMinTotalWidth(voices: Voice[]): number;
    /**
     * Get minimum width required to render all voices. Either `format` or
     * `preCalculateMinTotalWidth` must be called before this method.
     */
    getMinTotalWidth(): number;
    /** Calculate the resolution multiplier for `voices`. */
    static getResolutionMultiplier(voices: Voice[]): number;
    /** Create a `ModifierContext` for each tick in `voices`. */
    createModifierContexts(voices: Voice[]): void;
    /**
     * Create a `TickContext` for each tick in `voices`. Also calculate the
     * total number of ticks in voices.
     */
    createTickContexts(voices: Voice[]): AlignmentContexts<TickContext>;
    /**
     * Get the AlignmentContexts of TickContexts that were created by createTickContexts.
     * Returns undefined if createTickContexts has not yet been run.
     */
    getTickContexts(): AlignmentContexts<TickContext> | undefined;
    /**
     * This is the core formatter logic. Format voices and justify them
     * to `justifyWidth` pixels. `renderingContext` is required to justify elements
     * that can't retrieve widths without a canvas. This method sets the `x` positions
     * of all the tickables/notes in the formatter.
     */
    preFormat(justifyWidth?: number, renderingContext?: RenderContext, voicesParam?: Voice[], stave?: Stave): number;
    /** Calculate the total cost of this formatting decision. */
    evaluate(): number;
    /**
     * Run a single iteration of rejustification. At a high level, this method calculates
     * the overall "loss" (or cost) of this layout, and repositions tickcontexts in an
     * attempt to reduce the cost. You can call this method multiple times until it finds
     * and oscillates around a global minimum.
     * @param options[alpha] the "learning rate" for the formatter. It determines how much of a shift
     * the formatter should make based on its cost function.
     */
    tune(options?: {
        alpha?: number;
    }): number;
    /**
     * This is the top-level call for all formatting logic completed
     * after `x` *and* `y` values have been computed for the notes
     * in the voices.
     */
    postFormat(): this;
    /**
     * Take all `voices` and create `ModifierContext`s out of them. This tells
     * the formatters that the voices belong on a single stave.
     */
    joinVoices(voices: Voice[]): this;
    /**
     * Align rests in voices, justify the contexts, and position the notes
     * so voices are aligned and ready to render onto the stave. This method
     * mutates the `x` positions of all tickables in `voices`.
     *
     * Voices are full justified to fit in `justifyWidth` pixels.
     *
     * Set `options.context` to the rendering context. Set `options.align_rests`
     * to true to enable rest alignment.
     */
    format(voices: Voice[], justifyWidth?: number, options?: FormatParams): this;
    formatToStave(voices: Voice[], stave: Stave, optionsParam?: FormatParams): this;
    getTickContext(tick: number): TickContext | undefined;
}
