import { Glyph } from './glyph';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
export interface OrnamentMetrics {
    xOffset: number;
    yOffset: number;
    stemUpYOffset: number;
    reportedWidth: number;
}
/**
 * Ornament implements ornaments as modifiers that can be
 * attached to notes. The complete list of ornaments is available in
 * `tables.ts` under `Vex.Flow.ornamentCodes`.
 *
 * See `tests/ornament_tests.ts` for usage examples.
 */
export declare class Ornament extends Modifier {
    /** To enable logging for this class. Set `Vex.Flow.Ornament.DEBUG` to `true`. */
    static DEBUG: boolean;
    /** Ornaments category string. */
    static get CATEGORY(): string;
    static get minPadding(): number;
    protected ornament: {
        code: string;
    };
    protected stemUpYOffset: number;
    protected ornamentAlignWithNoteHead: string[] | boolean;
    protected type: string;
    protected delayed: boolean;
    protected reportedWidth: number;
    protected adjustForStemDirection: boolean;
    render_options: {
        accidentalUpperPadding: number;
        accidentalLowerPadding: number;
        font_scale: number;
    };
    protected glyph: Glyph;
    protected accidentalUpper?: Glyph;
    protected accidentalLower?: Glyph;
    protected delayXShift?: number;
    /** Arrange ornaments inside `ModifierContext` */
    static format(ornaments: Ornament[], state: ModifierContextState): boolean;
    /**
     * ornamentNoteTransition means the jazz ornament represents an effect from one note to another,
     * these are generally on the top of the staff.
     */
    static get ornamentNoteTransition(): string[];
    /**
     * ornamentAttack indicates something that happens in the attach, placed before the note and
     * any accidentals
     */
    static get ornamentAttack(): string[];
    /**
     * The ornament is aligned based on the note head, but without regard to whether the
     * stem goes up or down.
     */
    static get ornamentAlignWithNoteHead(): string[];
    /**
     * An ornament that happens on the release of the note, generally placed after the
     * note and overlapping the next beat/measure..
     */
    static get ornamentRelease(): string[];
    /** ornamentArticulation goes above/below the note based on space availablity */
    static get ornamentArticulation(): string[];
    /**
     * Legacy ornaments have hard-coded metrics.  If additional ornament types are
     * added, get their metrics here.
     */
    getMetrics(): OrnamentMetrics;
    /**
     * Create a new ornament of type `type`, which is an entry in
     * `Vex.Flow.ornamentCodes` in `tables.ts`.
     */
    constructor(type: string);
    /** Set whether the ornament is to be delayed. */
    setDelayed(delayed: boolean): this;
    /** Set the upper accidental for the ornament. */
    setUpperAccidental(accid: string): this;
    /** Set the lower accidental for the ornament. */
    setLowerAccidental(accid: string): this;
    /** Render ornament in position next to note. */
    draw(): void;
}
