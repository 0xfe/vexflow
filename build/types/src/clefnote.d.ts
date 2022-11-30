import { Clef, ClefType } from './clef';
import { Glyph } from './glyph';
import { Note } from './note';
import { RenderContext } from './rendercontext';
/** ClefNote implements clef annotations in measures. */
export declare class ClefNote extends Note {
    static get CATEGORY(): string;
    protected glyph: Glyph;
    protected clef: Clef;
    protected type: string;
    constructor(type: string, size?: string, annotation?: string);
    /** Set clef type, size and annotation. */
    setType(type: string, size: string, annotation: string): this;
    /** Get associated clef. */
    getClef(): ClefType;
    /** Set associated context. */
    setContext(context: RenderContext): this;
    preFormat(): this;
    /** Render clef note. */
    draw(): void;
}
