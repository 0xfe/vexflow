import { Element } from './element';
import { Note } from './note';
export interface CurveOptions {
    /** Two control points for the bezier curves. */
    cps?: {
        x: number;
        y: number;
    }[];
    thickness?: number;
    x_shift?: number;
    y_shift?: number;
    position?: string | number;
    position_end?: string | number;
    invert?: boolean;
}
export declare enum CurvePosition {
    NEAR_HEAD = 1,
    NEAR_TOP = 2
}
export declare class Curve extends Element {
    static get CATEGORY(): string;
    render_options: Required<CurveOptions>;
    protected from: Note;
    protected to: Note;
    static get Position(): typeof CurvePosition;
    static get PositionString(): Record<string, number>;
    constructor(from: Note, to: Note, options: CurveOptions);
    setNotes(from: Note, to: Note): this;
    /**
     * @return {boolean} Returns true if this is a partial bar.
     */
    isPartial(): boolean;
    renderCurve(params: {
        last_y: number;
        last_x: number;
        first_y: number;
        first_x: number;
        direction: number;
    }): void;
    draw(): boolean;
}
