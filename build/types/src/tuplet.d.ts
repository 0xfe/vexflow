/**
 * ## Description
 *
 * Create a new tuplet from the specified notes. The notes must
 * be part of the same voice. If they are of different rhythmic
 * values, then options.num_notes must be set.
 *
 * @constructor
 * @param {Array.<Vex.Flow.StaveNote>} A set of notes: staveNotes,
 *   notes, etc... any class that inherits stemmableNote at some
 *   point in its prototype chain.
 * @param options: object {
 *
 *   num_notes: fit this many notes into...
 *   notes_occupied: ...the space of this many notes
 *
 *       Together, these two properties make up the tuplet ratio
 *     in the form of num_notes : notes_occupied.
 *       num_notes defaults to the number of notes passed in, so
 *     it is important that if you omit this property, all of
 *     the notes passed should be of the same note value.
 *       notes_occupied defaults to 2 -- so you should almost
 *     certainly pass this parameter for anything other than
 *     a basic triplet.
 *
 *   location:
 *     default 1, which is above the notes: ┌─── 3 ───┐
 *      -1 is below the notes └─── 3 ───┘
 *
 *   bracketed: boolean, draw a bracket around the tuplet number
 *     when true: ┌─── 3 ───┐   when false: 3
 *     defaults to true if notes are not beamed, false otherwise
 *
 *   ratioed: boolean
 *     when true: ┌─── 7:8 ───┐, when false: ┌─── 7 ───┐
 *     defaults to true if the difference between num_notes and
 *     notes_occupied is greater than 1.
 *
 *   y_offset: int, default 0
 *     manually offset a tuplet, for instance to avoid collisions
 *     with articulations, etc...
 * }
 */
import { Element } from './element';
import { Glyph } from './glyph';
import { Note } from './note';
export interface TupletOptions {
    beats_occupied?: number;
    bracketed?: boolean;
    location?: number;
    notes_occupied?: number;
    num_notes?: number;
    ratioed?: boolean;
    y_offset?: number;
}
export interface TupletMetrics {
    noteHeadOffset: number;
    stemOffset: number;
    bottomLine: number;
    topModifierOffset: number;
}
export declare const enum TupletLocation {
    BOTTOM = -1,
    TOP = 1
}
export declare class Tuplet extends Element {
    static get CATEGORY(): string;
    notes: Note[];
    protected options: TupletOptions;
    protected num_notes: number;
    protected point: number;
    protected bracketed: boolean;
    protected y_pos: number;
    protected x_pos: number;
    protected width: number;
    protected location: number;
    protected notes_occupied: number;
    protected ratioed: boolean;
    protected numerator_glyphs: Glyph[];
    protected denom_glyphs: Glyph[];
    static get LOCATION_TOP(): number;
    static get LOCATION_BOTTOM(): number;
    static get NESTING_OFFSET(): number;
    static get metrics(): TupletMetrics;
    constructor(notes: Note[], options?: TupletOptions);
    attach(): void;
    detach(): void;
    /**
     * Set whether or not the bracket is drawn.
     */
    setBracketed(bracketed: boolean): this;
    /**
     * Set whether or not the ratio is shown.
     */
    setRatioed(ratioed: boolean): this;
    /**
     * Set the tuplet indicator to be displayed either on the top or bottom of the stave.
     */
    setTupletLocation(location: number): this;
    getNotes(): Note[];
    getNoteCount(): number;
    beatsOccupiedDeprecationWarning(): void;
    getBeatsOccupied(): number;
    setBeatsOccupied(beats: number): void;
    getNotesOccupied(): number;
    setNotesOccupied(notes: number): void;
    resolveGlyphs(): void;
    getNestedTupletCount(): number;
    getYPosition(): number;
    draw(): void;
}
