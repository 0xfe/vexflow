import { KeySignature } from './keysignature';
import { ModifierContext } from './modifiercontext';
import { Note } from './note';
export declare class KeySigNote extends Note {
    static get CATEGORY(): string;
    protected keySignature: KeySignature;
    constructor(keySpec: string, cancelKeySpec?: string, alterKeySpec?: string[]);
    addToModifierContext(mc: ModifierContext): this;
    preFormat(): this;
    draw(): void;
}
