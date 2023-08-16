import { ModifierContext } from './modifiercontext';
import { Note } from './note';
import { TimeSignature } from './timesignature';
export declare class TimeSigNote extends Note {
    static get CATEGORY(): string;
    protected timeSig: TimeSignature;
    constructor(timeSpec: string, customPadding?: number);
    addToModifierContext(mc: ModifierContext): this;
    preFormat(): this;
    draw(): void;
}
