import { FontInfo } from './font';
import { TieNotes } from './stavetie';
import { TabTie } from './tabtie';
export declare class TabSlide extends TabTie {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    static get SLIDE_UP(): number;
    static get SLIDE_DOWN(): number;
    static createSlideUp(notes: TieNotes): TabSlide;
    static createSlideDown(notes: TieNotes): TabSlide;
    /**
     * @param notes is a struct of the form:
     *  {
     *    first_note: Note,
     *    last_note: Note,
     *    first_indices: [n1, n2, n3],
     *    last_indices: [n1, n2, n3]
     *  }
     * @param notes.first_note the starting note of the slide
     * @param notes.last_note the ending note of the slide
     * @param notes.first_indices specifies which string + fret positions of the TabNote are used in this slide. zero indexed.
     * @param notes.last_indices currently unused. we assume it's the same as first_indices.
     *
     * @param direction TabSlide.SLIDE_UP or TabSlide.SLIDE_DOWN
     */
    constructor(notes: TieNotes, direction?: number);
    renderTie(params: {
        direction: number;
        first_x_px: number;
        last_x_px: number;
        last_ys: number[];
        first_ys: number[];
    }): void;
}
