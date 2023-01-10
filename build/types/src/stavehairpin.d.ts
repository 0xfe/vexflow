import { Element } from './element';
import { Note } from './note';
import { RenderContext } from './rendercontext';
export interface StaveHairpinRenderOptions {
    right_shift_ticks?: number;
    left_shift_ticks?: number;
    left_shift_px: number;
    right_shift_px: number;
    height: number;
    y_shift: number;
}
export declare class StaveHairpin extends Element {
    static get CATEGORY(): string;
    protected hairpin: number;
    protected position: number;
    render_options: StaveHairpinRenderOptions;
    protected notes: Record<string, Note>;
    protected first_note?: Note;
    protected last_note?: Note;
    static readonly type: {
        CRESC: number;
        DECRESC: number;
    };
    static FormatByTicksAndDraw(ctx: RenderContext, formatter: {
        pixelsPerTick: number;
    }, notes: Record<string, Note>, type: number, position: number, options: StaveHairpinRenderOptions): void;
    /**
     * Create a new hairpin from the specified notes.
     *
     * @param {!Object} notes The notes to tie up.
     * Notes is a struct that has:
     *
     *  {
     *    first_note: Note,
     *    last_note: Note,
     *  }
     * @param {!Object} type The type of hairpin
     */
    constructor(notes: Record<string, Note>, type: number);
    setPosition(position: number): this;
    setRenderOptions(options: StaveHairpinRenderOptions): this;
    /**
     * Set the notes to attach this hairpin to.
     *
     * @param {!Object} notes The start and end notes.
     */
    setNotes(notes: Record<string, Note>): this;
    renderHairpin(params: {
        first_x: number;
        last_x: number;
        first_y: number;
        last_y: number;
        staff_height: number;
    }): void;
    draw(): void;
}
