import { BoundingBox } from './boundingbox';
import { Element } from './element';
import { Fraction } from './fraction';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
import { Tickable } from './tickable';
export interface VoiceTime {
    num_beats: number;
    beat_value: number;
    /** Defaults to `Flow.RESOLUTION` if not provided. */
    resolution?: number;
}
export declare enum VoiceMode {
    STRICT = 1,
    SOFT = 2,
    FULL = 3
}
/**
 * `Voice` is mainly a container object to group `Tickables` for formatting.
 */
export declare class Voice extends Element {
    static get CATEGORY(): string;
    /**
     * Modes allow the addition of ticks in three different ways:
     * - STRICT: This is the default. Ticks must fill the voice.
     * - SOFT: Ticks can be added without restrictions.
     * - FULL: Ticks do not need to fill the voice, but can't exceed the maximum tick length.
     */
    static get Mode(): typeof VoiceMode;
    protected resolutionMultiplier: number;
    protected smallestTickCount: Fraction;
    protected stave?: Stave;
    protected mode: VoiceMode;
    protected expTicksUsed?: number;
    protected preFormatted: boolean;
    protected options: {
        softmaxFactor: number;
    };
    protected readonly totalTicks: Fraction;
    protected readonly ticksUsed: Fraction;
    protected readonly largestTickWidth: number;
    protected readonly tickables: Tickable[];
    protected readonly time: Required<VoiceTime>;
    constructor(time?: VoiceTime | string);
    /** Get the total ticks in the voice. */
    getTotalTicks(): Fraction;
    /** Get the total ticks used in the voice by all the tickables. */
    getTicksUsed(): Fraction;
    /** Get the largest width of all the tickables. */
    getLargestTickWidth(): number;
    /** Get the tick count for the shortest tickable */
    getSmallestTickCount(): Fraction;
    /** Get the tickables in the voice. */
    getTickables(): Tickable[];
    /** Get the voice mode (Voice.Mode.SOFT, STRICT, or FULL) */
    getMode(): number;
    /**
     * Set the voice mode.
     * @param mode value from `VoiceMode` or Voice.Mode
     */
    setMode(mode: number): this;
    /** Get the resolution multiplier for the voice. */
    getResolutionMultiplier(): number;
    /** Get the actual tick resolution for the voice. */
    getActualResolution(): number;
    /** Set the voice's stave. */
    setStave(stave: Stave): this;
    getStave(): Stave | undefined;
    /** Get the bounding box for the voice. */
    getBoundingBox(): BoundingBox | undefined;
    /** Set the voice mode to strict or soft. */
    setStrict(strict: boolean): this;
    /** Determine if the voice is complete according to the voice mode. */
    isComplete(): boolean;
    /**
     * We use softmax to layout the tickables proportional to the exponent of
     * their duration. The softmax factor is used to determine the 'linearness' of
     * the layout.
     *
     * The softmax of all the tickables in this voice should sum to 1.
     */
    setSoftmaxFactor(factor: number): this;
    /**
     * Calculate the sum of the exponents of all the ticks in this voice to use
     * as the denominator of softmax.  (It is not the sum of the softmax(t) over all tickables)
     *
     * Note that the "exp" of "expTicksUsed" stands for "expontential" ticks used,
     * not "expected" ticks used.
     */
    protected reCalculateExpTicksUsed(): number;
    /** Get the softmax-scaled value of a tick duration. 'tickValue' is a number. */
    softmax(tickValue: number): number;
    /** Add a tickable to the voice. */
    addTickable(tickable: Tickable): this;
    /** Add an array of tickables to the voice. */
    addTickables(tickables: Tickable[]): this;
    /** Preformat the voice by applying the voice's stave to each note. */
    preFormat(): this;
    checkStave(): Stave;
    /**
     * Render the voice onto the canvas `context` and an optional `stave`.
     * If `stave` is omitted, it is expected that the notes have staves
     * already set.
     *
     * This method also calculates the voice's boundingBox while drawing
     * the notes. Note the similarities with this.getBoundingBox().
     */
    draw(context?: RenderContext, stave?: Stave): void;
}
