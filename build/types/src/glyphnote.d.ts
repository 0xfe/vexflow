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
    protected glyph: Glyph;
    constructor(glyph: Glyph, noteStruct: NoteStruct, options?: GlyphNoteOptions);
    setGlyph(glyph: Glyph): this;
    getBoundingBox(): BoundingBox | undefined;
    preFormat(): this;
    drawModifiers(): void;
    /** Get the glyph width. */
    getGlyphWidth(): number;
    draw(): void;
}
