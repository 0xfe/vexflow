import { StaveTie, TieNotes } from './stavetie';
export declare class TabTie extends StaveTie {
    static get CATEGORY(): string;
    static createHammeron(notes: TieNotes): TabTie;
    static createPulloff(notes: TieNotes): TabTie;
    /**
     * @param notes is a struct that has:
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
}
