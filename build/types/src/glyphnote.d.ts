import { BoundingBox } from './boundingbox';
import { Glyph } from './glyph';
import { Note, NoteStruct } from './note';
export interface GlyphNoteOptions {
    ignoreTicks?: boolean;
    line?: number;
}
export declare class GlyphNote extends Note {
    static get CATEGORY(): string;
    protected options: Required<GlyphNoteOptions>;
    constructor(glyph: Glyph | undefined, noteStruct: NoteStruct, options?: GlyphNoteOptions);
    setGlyph(glyph: Glyph): this;
    getBoundingBox(): BoundingBox;
    preFormat(): this;
    drawModifiers(): void;
    draw(): void;
}
