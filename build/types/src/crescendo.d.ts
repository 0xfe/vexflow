import { Note, NoteStruct } from './note';
export interface CrescendoParams {
    reverse: boolean;
    height: number;
    y: number;
    end_x: number;
    begin_x: number;
}
export declare class Crescendo extends Note {
    static DEBUG: boolean;
    /** Crescendo category string. */
    static get CATEGORY(): string;
    protected decrescendo: boolean;
    protected height: number;
    protected line: number;
    protected options: {
        extend_left: number;
        extend_right: number;
        y_shift: number;
    };
    constructor(noteStruct: NoteStruct);
    setLine(line: number): this;
    setHeight(height: number): this;
    setDecrescendo(decresc: boolean): this;
    preFormat(): this;
    draw(): void;
}
