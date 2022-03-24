import { ModifierContext } from './modifiercontext';
import { Note } from './note';
import { TimeSignatureInfo } from './timesignature';
export declare class TimeSigNote extends Note {
    static get CATEGORY(): string;
    protected timeSigInfo: TimeSignatureInfo;
    constructor(timeSpec: string, customPadding?: number);
    addToModifierContext(mc: ModifierContext): this;
    preFormat(): this;
    draw(): void;
}
