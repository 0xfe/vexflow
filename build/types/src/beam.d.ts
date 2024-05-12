import { Element } from './element';
import { Fraction } from './fraction';
import { RenderContext } from './rendercontext';
import { StemmableNote } from './stemmablenote';
import { Voice } from './voice';
export declare const BEAM_LEFT = "L";
export declare const BEAM_RIGHT = "R";
export declare const BEAM_BOTH = "B";
export type PartialBeamDirection = typeof BEAM_LEFT | typeof BEAM_RIGHT | typeof BEAM_BOTH;
/** `Beams` span over a set of `StemmableNotes`. */
export declare class Beam extends Element {
    static get CATEGORY(): string;
    render_options: {
        flat_beam_offset?: number;
        flat_beams: boolean;
        secondary_break_ticks?: number;
        show_stemlets: boolean;
        beam_width: number;
        max_slope: number;
        min_slope: number;
        slope_iterations: number;
        slope_cost: number;
        stemlet_extension: number;
        partial_beam_length: number;
        min_flat_beam_offset: number;
    };
    notes: StemmableNote[];
    postFormatted: boolean;
    slope: number;
    private readonly stem_direction;
    private readonly ticks;
    private y_shift;
    private break_on_indices;
    private beam_count;
    private unbeamable?;
    /**
     * Overrides to default beam directions for secondary-level beams that do not
     * connect to any other note. See further explanation at
     * `setPartialBeamSideAt`
     */
    private forcedPartialDirections;
    /** Get the direction of the beam */
    getStemDirection(): number;
    /**
     * Get the default beam groups for a provided time signature.
     * Attempt to guess if the time signature is not found in table.
     * Currently this is fairly naive.
     */
    static getDefaultBeamGroups(time_sig: string): Fraction[];
    /**
     * A helper function to automatically build basic beams for a voice. For more
     * complex auto-beaming use `Beam.generateBeams()`.
     * @param voice the voice to generate the beams for
     * @param stem_direction a stem direction to apply to the entire voice
     * @param groups an array of `Fraction` representing beat groupings for the beam
     */
    static applyAndGetBeams(voice: Voice, stem_direction?: number, groups?: Fraction[]): Beam[];
    /**
     * A helper function to autimatically build beams for a voice with
     * configuration options.
     *
     * Example configuration object:
     *
     * ```
     * config = {
     *   groups: [new Vex.Flow.Fraction(2, 8)],
     *   stem_direction: -1,
     *   beam_rests: true,
     *   beam_middle_only: true,
     *   show_stemlets: false
     * };
     * ```
     * @param notes an array of notes to create the beams for
     * @param config the configuration object
     * @param config.stem_direction set to apply the same direction to all notes
     * @param config.beam_rests set to `true` to include rests in the beams
     * @param config.beam_middle_only set to `true` to only beam rests in the middle of the beat
     * @param config.show_stemlets set to `true` to draw stemlets for rests
     * @param config.maintain_stem_directions set to `true` to not apply new stem directions
     * @param config.groups array of `Fractions` that represent the beat structure to beam the notes
     *
     */
    static generateBeams(notes: StemmableNote[], config?: {
        flat_beam_offset?: number;
        flat_beams?: boolean;
        secondary_breaks?: string;
        show_stemlets?: boolean;
        maintain_stem_directions?: boolean;
        beam_middle_only?: boolean;
        beam_rests?: boolean;
        groups?: Fraction[];
        stem_direction?: number;
    }): Beam[];
    constructor(notes: StemmableNote[], auto_stem?: boolean);
    /** Get the notes in this beam. */
    getNotes(): StemmableNote[];
    /** Get the max number of beams in the set of notes. */
    getBeamCount(): number;
    /** Set which note `indices` to break the secondary beam at. */
    breakSecondaryAt(indices: number[]): this;
    /**
     * Forces the direction of a partial beam (a secondary-level beam that exists
     * on one note only of the beam group). This is useful in rhythms such as 6/8
     * eighth-sixteenth-eighth-sixteenth, where the direction of the beam on the
     * first sixteenth note can help imply whether the rhythm is to be felt as
     * three groups of eighth notes (typical) or as two groups of three-sixteenths
     * (less common):
     * ```
     *  ┌───┬──┬──┐      ┌──┬──┬──┐
     *  │   ├─ │ ─┤  vs  │ ─┤  │ ─┤
     *  │   │  │  │      │  │  │  │
     * ```
     */
    setPartialBeamSideAt(noteIndex: number, side: PartialBeamDirection): this;
    /**
     * Restore the default direction of a partial beam (a secondary-level beam
     * that does not connect to any other notes).
     */
    unsetPartialBeamSideAt(noteIndex: number): this;
    /** Return the y coordinate for linear function. */
    getSlopeY(x: number, first_x_px: number, first_y_px: number, slope: number): number;
    /** Calculate the best possible slope for the provided notes. */
    calculateSlope(): void;
    /** Calculate a slope and y-shift for flat beams. */
    calculateFlatSlope(): void;
    /** Return the Beam y offset. */
    getBeamYToDraw(): number;
    /**
     * Create new stems for the notes in the beam, so that each stem
     * extends into the beams.
     */
    applyStemExtensions(): void;
    /** Return upper level beam direction. */
    lookupBeamDirection(duration: string, prev_tick: number, tick: number, next_tick: number, noteIndex: number): PartialBeamDirection;
    /** Get the x coordinates for the beam lines of specific `duration`. */
    getBeamLines(duration: string): {
        start: number;
        end?: number;
    }[];
    /** Render the stems for each note. */
    protected drawStems(ctx: RenderContext): void;
    protected drawBeamLines(ctx: RenderContext): void;
    /** Pre-format the beam. */
    preFormat(): this;
    /**
     * Post-format the beam. This can only be called after
     * the notes in the beam have both `x` and `y` values. ie: they've
     * been formatted and have staves.
     */
    postFormat(): void;
    /** Render the beam to the canvas context */
    draw(): void;
}
