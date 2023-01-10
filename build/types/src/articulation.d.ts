import { Builder } from './easyscore';
import { Glyph } from './glyph';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
import { StemmableNote } from './stemmablenote';
export interface ArticulationStruct {
    code?: string;
    aboveCode?: string;
    belowCode?: string;
    between_lines: boolean;
}
/**
 * Articulations and Accents are modifiers that can be
 * attached to notes. The complete list of articulations is available in
 * `tables.ts` under `Vex.Flow.articulationCodes`.
 *
 * See `tests/articulation_tests.ts` for usage examples.
 */
export declare class Articulation extends Modifier {
    /** To enable logging for this class. Set `Vex.Flow.Articulation.DEBUG` to `true`. */
    static DEBUG: boolean;
    /** Articulations category string. */
    static get CATEGORY(): string;
    protected static readonly INITIAL_OFFSET: number;
    /** Articulation code provided to the constructor. */
    readonly type: string;
    render_options: {
        font_scale: number;
    };
    protected articulation: ArticulationStruct;
    protected glyph: Glyph;
    /**
     * FIXME:
     * Most of the complex formatting logic (ie: snapping to space) is
     * actually done in .render(). But that logic belongs in this method.
     *
     * Unfortunately, this isn't possible because, by this point, stem lengths
     * have not yet been finalized. Finalized stem lengths are required to determine the
     * initial position of any stem-side articulation.
     *
     * This indicates that all objects should have their stave set before being
     * formatted. It can't be an optional if you want accurate vertical positioning.
     * Consistently positioned articulations that play nice with other modifiers
     * won't be possible until we stop relying on render-time formatting.
     *
     * Ideally, when this function has completed, the vertical articulation positions
     * should be ready to render without further adjustment. But the current state
     * is far from this ideal.
     */
    static format(articulations: Articulation[], state: ModifierContextState): boolean;
    static easyScoreHook({ articulations }: {
        articulations: string;
    }, note: StemmableNote, builder: Builder): void;
    /**
     * Create a new articulation.
     * @param type entry in `Vex.Flow.articulationCodes` in `tables.ts` or Glyph code.
     *
     * Notes (by default):
     * - Glyph codes ending with 'Above' will be positioned ABOVE
     * - Glyph codes ending with 'Below' will be positioned BELOW
     */
    constructor(type: string);
    protected reset(): void;
    /** Set if articulation should be rendered between lines. */
    setBetweenLines(betweenLines?: boolean): this;
    /** Render articulation in position next to note. */
    draw(): void;
}
