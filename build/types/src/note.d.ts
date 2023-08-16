import { Beam } from './beam';
import { Fraction } from './fraction';
import { GlyphProps } from './glyph';
import { Modifier } from './modifier';
import { RenderContext } from './rendercontext';
import { Stave } from './stave';
import { Stroke } from './strokes';
import { Tickable } from './tickable';
import { TickContext } from './tickcontext';
import { Voice } from './voice';
export interface KeyProps {
    stem_down_x_offset?: number;
    stem_up_x_offset?: number;
    key: string;
    octave: number;
    line: number;
    int_value?: number;
    accidental?: string;
    code?: string;
    stroke: number;
    shift_right?: number;
    displaced: boolean;
}
export interface NoteMetrics {
    /** The total width of the note (including modifiers). */
    width: number;
    glyphWidth?: number;
    /** The width of the note head only. */
    notePx: number;
    /** Start `X` for left modifiers. */
    modLeftPx: number;
    /** Start `X` for right modifiers. */
    modRightPx: number;
    /** Extra space on left of note. */
    leftDisplacedHeadPx: number;
    glyphPx: number;
    /** Extra space on right of note. */
    rightDisplacedHeadPx: number;
}
export interface NoteDuration {
    duration: string;
    dots: number;
    type: string;
}
export interface ParsedNote {
    duration: string;
    type: string;
    customTypes: string[];
    dots: number;
    ticks: number;
}
export interface NoteStruct {
    /** Array of pitches, e.g: `['c/4', 'e/4', 'g/4']` */
    keys?: string[];
    /** The time length (e.g., `q` for quarter, `h` for half, `8` for eighth etc.). */
    duration: string;
    line?: number;
    /** The number of dots, which affects the duration. */
    dots?: number;
    /** The note type (e.g., `r` for rest, `s` for slash notes, etc.). */
    type?: string;
    align_center?: boolean;
    duration_override?: Fraction;
}
/**
 * Note implements an abstract interface for notes and chords that
 * are rendered on a stave. Notes have some common properties: All of them
 * have a value (e.g., pitch, fret, etc.) and a duration (quarter, half, etc.)
 *
 * Some notes have stems, heads, dots, etc. Most notational elements that
 * surround a note are called *modifiers*, and every note has an associated
 * array of them. All notes also have a rendering context and belong to a stave.
 */
export declare abstract class Note extends Tickable {
    static get CATEGORY(): string;
    /** Debug helper. Displays various note metrics for the given note. */
    static plotMetrics(ctx: RenderContext, note: Tickable, yPos: number): void;
    protected static parseDuration(durationString?: string): NoteDuration | undefined;
    protected static parseNoteStruct(noteStruct: NoteStruct): ParsedNote | undefined;
    glyphProps: GlyphProps;
    keys: string[];
    keyProps: KeyProps[];
    protected stave?: Stave;
    render_options: {
        draw_stem_through_stave?: boolean;
        draw?: boolean;
        draw_dots?: boolean;
        draw_stem?: boolean;
        y_shift: number;
        extend_left?: number;
        extend_right?: number;
        glyph_font_scale: number;
        annotation_spacing: number;
        glyph_font_size?: number;
        scale: number;
        font: string;
        stroke_px: number;
    };
    protected duration: string;
    protected leftDisplacedHeadPx: number;
    protected rightDisplacedHeadPx: number;
    protected noteType: string;
    protected customGlyphs: GlyphProps[];
    protected ys: number[];
    protected customTypes: string[];
    protected playNote?: Note;
    protected beam?: Beam;
    /**
     * Every note is a tickable, i.e., it can be mutated by the `Formatter` class for
     * positioning and layout.
     *
     * @param noteStruct To create a new note you need to provide a `noteStruct`.
     */
    constructor(noteStruct: NoteStruct);
    /**
     * Get the play note, which is arbitrary data that can be used by an
     * audio player.
     */
    getPlayNote(): Note | undefined;
    /**
     * Set the play note, which is arbitrary data that can be used by an
     * audio player.
     */
    setPlayNote(note: Note): this;
    /**
     * @returns true if this note is a type of rest.
     *
     * Rests don't have pitches, but take up space in the score.
     * Subclasses should override this default implementation.
     */
    isRest(): boolean;
    /** Add stroke. */
    addStroke(index: number, stroke: Stroke): this;
    /** Get the target stave. */
    getStave(): Stave | undefined;
    /** Check and get the target stave. */
    checkStave(): Stave;
    /** Set the target stave. */
    setStave(stave: Stave): this;
    /** Get spacing to the left of the notes. */
    getLeftDisplacedHeadPx(): number;
    /** Get spacing to the right of the notes. */
    getRightDisplacedHeadPx(): number;
    /** Set spacing to the left of the notes. */
    setLeftDisplacedHeadPx(x: number): this;
    /** Set spacing to the right of the notes. */
    setRightDisplacedHeadPx(x: number): this;
    /** True if this note has no duration (e.g., bar notes, spacers, etc.). */
    shouldIgnoreTicks(): boolean;
    /** Get the stave line number for the note. */
    getLineNumber(isTopNote?: boolean): number;
    /** Get the stave line number for rest. */
    getLineForRest(): number;
    /**
     * @deprecated Use `getGlyphProps()` instead.
     */
    getGlyph(): any;
    /** Get the glyph associated with this note. */
    getGlyphProps(): GlyphProps;
    /** Get the glyph width. */
    getGlyphWidth(): number;
    /**
     * Set Y positions for this note. Each Y value is associated with
     * an individual pitch/key within the note/chord.
     */
    setYs(ys: number[]): this;
    /**
     * Get Y positions for this note. Each Y value is associated with
     * an individual pitch/key within the note/chord.
     */
    getYs(): number[];
    /**
     * Get the Y position of the space above the stave onto which text can
     * be rendered.
     */
    getYForTopText(text_line: number): number;
    /** Return the voice that this note belongs in. */
    getVoice(): Voice;
    /** Attach this note to `voice`. */
    setVoice(voice: Voice): this;
    /** Get the `TickContext` for this note. */
    getTickContext(): TickContext;
    /** Set the `TickContext` for this note. */
    setTickContext(tc: TickContext): this;
    /** Accessor to duration. */
    getDuration(): string;
    /** Accessor to isDotted. */
    isDotted(): boolean;
    /** Accessor to hasStem. */
    hasStem(): boolean;
    /** Accessor to note type. */
    getNoteType(): string;
    /** Get the beam. */
    getBeam(): Beam | undefined;
    /** Check and get the beam. */
    checkBeam(): Beam;
    /** Check it has a beam. */
    hasBeam(): boolean;
    /** Set the beam. */
    setBeam(beam: Beam): this;
    /**
     * Attach a modifier to this note.
     * @param modifier the Modifier to add.
     * @param index of the key to modify.
     * @returns this
     */
    addModifier(modifier: Modifier, index?: number): this;
    /** Get all modifiers of a specific type in `this.modifiers`. */
    getModifiersByType(type: string): Modifier[];
    /** Get the coordinates for where modifiers begin. */
    getModifierStartXY(position?: number, index?: number, options?: any): {
        x: number;
        y: number;
    };
    getRightParenthesisPx(index: number): number;
    getLeftParenthesisPx(index: number): number;
    getFirstDotPx(): number;
    /** Get the metrics for this note. */
    getMetrics(): NoteMetrics;
    /**
     * Get the absolute `X` position of this note's tick context. This
     * excludes x_shift, so you'll need to factor it in if you're
     * looking for the post-formatted x-position.
     */
    getAbsoluteX(): number;
    /** Get point for notes. */
    static getPoint(size?: string): number;
    /** Get the direction of the stem. */
    getStemDirection(): number;
    /** Get the top and bottom `y` values of the stem. */
    getStemExtents(): Record<string, number>;
    /** Get the `x` coordinate to the right of the note. */
    getTieRightX(): number;
    /** Get the `x` coordinate to the left of the note. */
    getTieLeftX(): number;
    getKeys(): string[];
    getKeyProps(): KeyProps[];
}
