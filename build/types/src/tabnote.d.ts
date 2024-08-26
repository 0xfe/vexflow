import { GlyphProps } from './glyph';
import { Stave } from './stave';
import { StaveNoteStruct } from './stavenote';
import { StemmableNote } from './stemmablenote';
export interface TabNotePosition {
    str: number;
    fret: number | string;
}
export interface TabNoteStruct extends StaveNoteStruct {
    positions: TabNotePosition[];
}
export declare class TabNote extends StemmableNote {
    static get CATEGORY(): string;
    protected ghost: boolean;
    protected glyphPropsArr: GlyphProps[];
    protected positions: TabNotePosition[];
    constructor(noteStruct: TabNoteStruct, draw_stem?: boolean);
    greatestString: () => number;
    leastString: () => number;
    reset(): this;
    setGhost(ghost: boolean): this;
    hasStem(): boolean;
    getStemExtension(): number;
    updateWidth(): void;
    setStave(stave: Stave): this;
    getPositions(): TabNotePosition[];
    getModifierStartXY(position: number, index: number): {
        x: number;
        y: number;
    };
    getLineForRest(): number;
    preFormat(): void;
    getStemX(): number;
    getStemY(): number;
    getStemExtents(): {
        topY: number;
        baseY: number;
    };
    drawFlag(): void;
    drawModifiers(): void;
    drawStemThrough(): void;
    drawPositions(): void;
    draw(): void;
}
