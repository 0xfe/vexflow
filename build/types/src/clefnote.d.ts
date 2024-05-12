import { ClefAnnotatiomType, ClefType } from './clef';
import { Note } from './note';
/** ClefNote implements clef annotations in measures. */
export declare class ClefNote extends Note {
    static get CATEGORY(): string;
    protected clef: ClefType;
    protected annotation?: ClefAnnotatiomType;
    protected type: string;
    protected size: string;
    constructor(type: string, size?: string, annotation?: string);
    /** Set clef type, size and annotation. */
    setType(type: string, size: string, annotation: string): this;
    /** Get associated clef. */
    getClef(): ClefType;
    preFormat(): this;
    /** Render clef note. */
    draw(): void;
}
