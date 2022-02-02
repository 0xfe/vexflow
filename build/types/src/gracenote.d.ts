import { StaveNote, StaveNoteStruct } from './stavenote';
export interface GraceNoteStruct extends StaveNoteStruct {
    slash?: boolean;
}
export declare class GraceNote extends StaveNote {
    static get CATEGORY(): string;
    static get LEDGER_LINE_OFFSET(): number;
    static get SCALE(): number;
    protected slash: boolean;
    protected slur: boolean;
    constructor(noteStruct: GraceNoteStruct);
    getStemExtension(): number;
    getStaveNoteScale(): number;
    draw(): void;
    calcBeamedNotesSlashBBox(slashStemOffset: number, slashBeamOffset: number, protrusions: {
        beam: number;
        stem: number;
    }): Record<string, number>;
}
