import { Element } from './element';
import { Fraction } from './fraction';
import { Modifier } from './modifier';
import { ModifierContext } from './modifiercontext';
import { Stave } from './stave';
import { TickContext } from './tickcontext';
import { Tuplet } from './tuplet';
import { Voice } from './voice';
/** Formatter metrics interface */
export interface FormatterMetrics {
    duration: string;
    freedom: {
        left: number;
        right: number;
    };
    iterations: number;
    space: {
        used: number;
        mean: number;
        deviation: number;
    };
}
/**
 * Tickable represents a element that sit on a score and
 * has a duration, i.e., Tickables occupy space in the musical rendering dimension.
 */
export declare abstract class Tickable extends Element {
    static get CATEGORY(): string;
    protected ignore_ticks: boolean;
    protected tupletStack: Tuplet[];
    protected tuplet?: Tuplet;
    protected ticks: Fraction;
    protected center_x_shift: number;
    protected voice?: Voice;
    protected width: number;
    protected x_shift: number;
    protected modifierContext?: ModifierContext;
    protected tickContext?: TickContext;
    protected modifiers: Modifier[];
    protected tickMultiplier: Fraction;
    protected formatterMetrics: FormatterMetrics;
    protected intrinsicTicks: number;
    protected align_center: boolean;
    private _preFormatted;
    private _postFormatted;
    constructor();
    /** Reset the Tickable, this function will be overloaded. */
    reset(): this;
    /** Return the ticks. */
    getTicks(): Fraction;
    /** Check if it ignores the ticks. */
    shouldIgnoreTicks(): boolean;
    /** Ignore the ticks. */
    setIgnoreTicks(flag: boolean): this;
    /** Set width of note. Used by the formatter for positioning. */
    setWidth(width: number): void;
    /** Get width of note. Used by the formatter for positioning. */
    getWidth(): number;
    /** Displace note by `x` pixels. Used by the formatter. */
    setXShift(x: number): this;
    /** Get the `x` displaced pixels of the note. */
    getXShift(): number;
    /** Get `x` position of this tick context. */
    getX(): number;
    /** Return the formatterMetrics. */
    getFormatterMetrics(): FormatterMetrics;
    /** Return the center `x` shift. */
    getCenterXShift(): number;
    /** Set the center `x` shift. */
    setCenterXShift(centerXShift: number): this;
    isCenterAligned(): boolean;
    setCenterAlignment(align_center: boolean): this;
    /**
     * Return the associated voice. Every tickable must be associated with a voice.
     * This allows formatters and preFormatter to associate them with the right modifierContexts.
     */
    getVoice(): Voice;
    /** Set the associated voice. */
    setVoice(voice: Voice): void;
    /** Get the tuplet. */
    getTuplet(): Tuplet | undefined;
    /** Return a list of Tuplets. */
    getTupletStack(): Tuplet[];
    /**
     * Reset the specific Tuplet (if this is not provided, all tuplets are reset).
     * Remove any prior tuplets from the tick calculation and
     * reset the intrinsic tick value.
     */
    resetTuplet(tuplet?: Tuplet): this;
    /** Attach to new tuplet. */
    setTuplet(tuplet: Tuplet): this;
    /**
     * Add self to the provided ModifierContext `mc`.
     * If this tickable has modifiers, set modifierContext.
     * @returns this
     */
    addToModifierContext(mc: ModifierContext): this;
    /**
     * Optional, if tickable has modifiers, associate a Modifier.
     * @param mod the modifier
     */
    addModifier(modifier: Modifier, index?: number): this;
    /** Get the list of associated modifiers. */
    getModifiers(): Modifier[];
    /** Set the Tick Context. */
    setTickContext(tc: TickContext): void;
    checkTickContext(message?: string): TickContext;
    /** Preformat the Tickable. */
    preFormat(): void;
    /** Set preformatted status. */
    set preFormatted(value: boolean);
    get preFormatted(): boolean;
    /** Postformat the Tickable. */
    postFormat(): this;
    /** Set postformatted status. */
    set postFormatted(value: boolean);
    get postFormatted(): boolean;
    /** Return the intrinsic ticks. */
    getIntrinsicTicks(): number;
    /** Set the intrinsic ticks. */
    setIntrinsicTicks(intrinsicTicks: number): void;
    /** Get the tick multiplier. */
    getTickMultiplier(): Fraction;
    /** Apply a tick multiplier. */
    applyTickMultiplier(numerator: number, denominator: number): void;
    /** Set the duration. */
    setDuration(duration: Fraction): void;
    getAbsoluteX(): number;
    /** Attach this note to a modifier context. */
    setModifierContext(mc?: ModifierContext): this;
    /** Get `ModifierContext`. */
    getModifierContext(): ModifierContext | undefined;
    /** Check and get `ModifierContext`. */
    checkModifierContext(): ModifierContext;
    /** Get the target stave. */
    abstract getStave(): Stave | undefined;
    /** Set the target stave. */
    abstract setStave(stave: Stave): this;
    abstract getMetrics(): any;
}
