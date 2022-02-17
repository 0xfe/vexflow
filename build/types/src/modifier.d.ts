import { Element } from './element';
import { ModifierContext } from './modifiercontext';
import { Note } from './note';
export declare enum ModifierPosition {
    CENTER = 0,
    LEFT = 1,
    RIGHT = 2,
    ABOVE = 3,
    BELOW = 4
}
/**
 * `Modifier` is an abstract interface for notational elements that modify
 * a `Note`. Examples of modifiers are `Accidental`, `Annotation`, `Stroke`, etc.
 *
 * For a `Modifier` instance to be positioned correctly, it must be part of
 * a `ModifierContext`. All modifiers in the same context are rendered relative to
 * one another.
 *
 * Typically, all modifiers to a note are part of the same `ModifierContext` instance. Also,
 * in multi-voice staves, all modifiers to notes on the same `tick` are part of the same
 * `ModifierContext`. This ensures that multiple voices don't trample all over each other.
 */
export declare class Modifier extends Element {
    /**
     * Modifiers category string. Every modifier has a different category.
     * The `ModifierContext` uses this to determine the type and order of the modifiers.
     */
    static get CATEGORY(): string;
    /** Modifiers can be positioned almost anywhere, relative to a note. */
    static get Position(): typeof ModifierPosition;
    static get PositionString(): Record<string, number>;
    protected note?: Note;
    protected index?: number;
    protected width: number;
    protected text_line: number;
    protected position: ModifierPosition;
    protected y_shift: number;
    protected x_shift: number;
    private spacingFromNextModifier;
    private modifierContext?;
    constructor();
    /** Called when position changes. */
    protected reset(): void;
    /** Get modifier widths. */
    getWidth(): number;
    /** Set modifier widths. */
    setWidth(width: number): this;
    /** Get attached note (`StaveNote`, `TabNote`, etc.) */
    getNote(): Note;
    /**
     * Used in draw() to check and get the attached note (`StaveNote`, `TabNote`, etc.).
     * Also verifies that the index is valid.
     */
    checkAttachedNote(): Note;
    /**
     * Set attached note.
     * @param note (`StaveNote`, `TabNote`, etc.)
     */
    setNote(note: Note): this;
    /** Get note index, which is a specific note in a chord. */
    getIndex(): number | undefined;
    /** Check and get note index, which is a specific note in a chord. */
    checkIndex(): number;
    /** Set note index, which is a specific note in a chord. */
    setIndex(index: number): this;
    /** Get `ModifierContext`. */
    getModifierContext(): ModifierContext | undefined;
    /** Check and get `ModifierContext`. */
    checkModifierContext(): ModifierContext;
    /** Every modifier must be part of a `ModifierContext`. */
    setModifierContext(c: ModifierContext): this;
    /** Get position. */
    getPosition(): number;
    /**
     * Set position.
     * @param position CENTER | LEFT | RIGHT | ABOVE | BELOW
     */
    setPosition(position: string | number): this;
    /** Set the `text_line` for the modifier. */
    setTextLine(line: number): this;
    /** Shift modifier down `y` pixels. Negative values shift up. */
    setYShift(y: number): this;
    /** Set spacing from next modifier. */
    setSpacingFromNextModifier(x: number): void;
    /** Get spacing from next modifier. */
    getSpacingFromNextModifier(): number;
    /**
     * Shift modifier `x` pixels in the direction of the modifier. Negative values
     * shift reverse.
     */
    setXShift(x: number): this;
    /** Get shift modifier `x` */
    getXShift(): number;
    /** Render the modifier onto the canvas. */
    draw(): void;
    alignSubNotesWithNote(subNotes: Note[], note: Note): void;
}
