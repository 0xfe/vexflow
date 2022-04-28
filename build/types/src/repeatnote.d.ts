import { GlyphNote, GlyphNoteOptions } from './glyphnote';
import { NoteStruct } from './note';
export declare class RepeatNote extends GlyphNote {
    static get CATEGORY(): string;
    constructor(type: string, noteStruct?: NoteStruct, options?: GlyphNoteOptions);
}
