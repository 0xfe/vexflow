import { BoundingBox } from './boundingbox';
import { Clef, ClefType } from './clef';
import { ModifierContext } from './modifiercontext';
import { Note } from './note';
import { RenderContext } from './rendercontext';
/** ClefNote implements clef annotations in measures. */
export declare class ClefNote extends Note {
    static get CATEGORY(): string;
    protected clef_obj: Clef;
    protected type: string;
    protected clef: ClefType;
    constructor(type: string, size?: string, annotation?: string);
    /** Set clef type, size and annotation. */
    setType(type: string, size: string, annotation: string): this;
    /** Get associated clef. */
    getClef(): ClefType;
    /** Set associated context. */
    setContext(context: RenderContext): this;
    /** Get bounding box. */
    getBoundingBox(): BoundingBox | undefined;
    addToModifierContext(mc: ModifierContext): this;
    preFormat(): this;
    /** Render clef note. */
    draw(): void;
}
