import { Stave, StaveOptions } from './stave';
export declare class TabStave extends Stave {
    static get CATEGORY(): string;
    constructor(x: number, y: number, width: number, options?: StaveOptions);
    getYForGlyphs(): number;
    addTabGlyph(): this;
}
