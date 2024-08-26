import { Element } from './element';
import { FontInfo } from './font';
import { Note } from './note';
export interface TieNotes {
    first_note?: Note | null;
    last_note?: Note | null;
    first_indices?: number[];
    last_indices?: number[];
}
export declare class StaveTie extends Element {
    static get CATEGORY(): string;
    /** Default text font. */
    static TEXT_FONT: Required<FontInfo>;
    render_options: {
        cp2: number;
        last_x_shift: number;
        tie_spacing: number;
        cp1: number;
        first_x_shift: number;
        text_shift_x: number;
        y_shift: number;
    };
    protected text?: string;
    protected notes: TieNotes;
    protected direction?: number;
    /**
     * @param notes is a struct that has:
     *
     *  {
     *    first_note: Note,
     *    last_note: Note,
     *    first_indices: [n1, n2, n3],
     *    last_indices: [n1, n2, n3]
     *  }
     *
     * @param text
     */
    constructor(notes: TieNotes, text?: string);
    setDirection(direction: number): this;
    /**
     * Set the notes to attach this tie to.
     *
     * @param {!Object} notes The notes to tie up.
     */
    setNotes(notes: TieNotes): this;
    /**
     * @return {boolean} Returns true if this is a partial bar.
     */
    isPartial(): boolean;
    renderTie(params: {
        direction: number;
        first_x_px: number;
        last_x_px: number;
        last_ys: number[];
        first_ys: number[];
    }): void;
    renderText(first_x_px: number, last_x_px: number): void;
    /**
     * Returns the TieNotes structure of the first and last note this tie connects.
     */
    getNotes(): TieNotes;
    draw(): boolean;
}
