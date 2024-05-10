import { Beam } from './beam';
import { BoundingBox } from './boundingbox';
import { ElementStyle } from './element';
import { ModifierContextState } from './modifiercontext';
import { Note, NoteStruct } from './note';
import { NoteHead } from './notehead';
import { Stave } from './stave';
import { StemOptions } from './stem';
import { StemmableNote } from './stemmablenote';
export interface StaveNoteHeadBounds {
    y_top: number;
    y_bottom: number;
    displaced_x?: number;
    non_displaced_x?: number;
    highest_line: number;
    lowest_line: number;
    highest_displaced_line?: number;
    lowest_displaced_line?: number;
    highest_non_displaced_line: number;
    lowest_non_displaced_line: number;
}
export interface StaveNoteFormatSettings {
    line: number;
    maxLine: number;
    minLine: number;
    isrest: boolean;
    stemDirection?: number;
    stemMax: number;
    stemMin: number;
    voice_shift: number;
    is_displaced: boolean;
    note: StaveNote;
}
export interface StaveNoteStruct extends NoteStruct {
    /** `Stem.UP` or `Stem.DOWN`. */
    stem_direction?: number;
    auto_stem?: boolean;
    stem_down_x_offset?: number;
    stem_up_x_offset?: number;
    stroke_px?: number;
    glyph_font_scale?: number;
    octave_shift?: number;
    clef?: string;
}
export declare class StaveNote extends StemmableNote {
    static DEBUG: boolean;
    static get CATEGORY(): string;
    /**
     * @deprecated Use Stem.UP.
     */
    static get STEM_UP(): number;
    /**
     * @deprecated Use Stem.DOWN.
     */
    static get STEM_DOWN(): number;
    static get LEDGER_LINE_OFFSET(): number;
    static get minNoteheadPadding(): number;
    /** Format notes inside a ModifierContext. */
    static format(notes: StaveNote[], state: ModifierContextState): boolean;
    static postFormat(notes: Note[]): boolean;
    minLine: number;
    maxLine: number;
    protected readonly clef: string;
    protected readonly octave_shift?: number;
    protected displaced: boolean;
    protected dot_shiftY: number;
    protected use_default_head_x: boolean;
    protected ledgerLineStyle: ElementStyle;
    private _noteHeads;
    private sortedKeyProps;
    constructor(noteStruct: StaveNoteStruct);
    reset(): this;
    setBeam(beam: Beam): this;
    buildStem(): this;
    buildNoteHeads(): NoteHead[];
    autoStem(): void;
    calculateOptimalStemDirection(): number;
    calculateKeyProps(): void;
    getBoundingBox(): BoundingBox;
    getLineNumber(isTopNote?: boolean): number;
    /**
     * @returns true if this note is a type of rest. Rests don't have pitches, but take up space in the score.
     */
    isRest(): boolean;
    isChord(): boolean;
    hasStem(): boolean;
    hasFlag(): boolean;
    getStemX(): number;
    getYForTopText(textLine: number): number;
    getYForBottomText(textLine: number): number;
    setStave(stave: Stave): this;
    isDisplaced(): boolean;
    setNoteDisplaced(displaced: boolean): this;
    getTieRightX(): number;
    getTieLeftX(): number;
    getLineForRest(): number;
    getModifierStartXY(position: number, index: number, options?: {
        forceFlagRight?: boolean;
    }): {
        x: number;
        y: number;
    };
    setStyle(style: ElementStyle): this;
    setStemStyle(style: ElementStyle): this;
    getStemStyle(): ElementStyle | undefined;
    setLedgerLineStyle(style: ElementStyle): void;
    getLedgerLineStyle(): ElementStyle;
    setFlagStyle(style: ElementStyle): void;
    getFlagStyle(): ElementStyle | undefined;
    setKeyStyle(index: number, style: ElementStyle): this;
    setKeyLine(index: number, line: number): this;
    getKeyLine(index: number): number;
    getVoiceShiftWidth(): number;
    calcNoteDisplacements(): void;
    preFormat(): void;
    /**
     * @typedef {Object} noteHeadBounds
     * @property {number} y_top the highest notehead bound
     * @property {number} y_bottom the lowest notehead bound
     * @property {number|Null} displaced_x the starting x for displaced noteheads
     * @property {number|Null} non_displaced_x the starting x for non-displaced noteheads
     * @property {number} highest_line the highest notehead line in traditional music line
     *  numbering (bottom line = 1, top line = 5)
     * @property {number} lowest_line the lowest notehead line
     * @property {number|false} highest_displaced_line the highest staff line number
     *   for a displaced notehead
     * @property {number|false} lowest_displaced_line
     * @property {number} highest_non_displaced_line
     * @property {number} lowest_non_displaced_line
     */
    /**
     * Get the staff line and y value for the highest & lowest noteheads
     * @returns {noteHeadBounds}
     */
    getNoteHeadBounds(): StaveNoteHeadBounds;
    getNoteHeadBeginX(): number;
    getNoteHeadEndX(): number;
    get noteHeads(): NoteHead[];
    /** @deprecated use StaveNote.noteHeads instead. */
    get note_heads(): NoteHead[];
    drawLedgerLines(): void;
    drawModifiers(noteheadParam: NoteHead): void;
    shouldDrawFlag(): boolean;
    drawFlag(): void;
    drawNoteHeads(): void;
    drawStem(stemOptions?: StemOptions): void;
    /** Primarily used as the scaling factor for grace notes, GraceNote will return the required scale. */
    getStaveNoteScale(): number;
    /**
     * Override stemmablenote stem extension to adjust for distance from middle line.
     */
    getStemExtension(): number;
    draw(): void;
}
