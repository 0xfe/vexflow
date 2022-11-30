import { Modifier } from './modifier';
/** Tremolo implements tremolo notation. */
export declare class Tremolo extends Modifier {
    static get CATEGORY(): string;
    protected readonly code: string;
    protected readonly num: number;
    /** Extra spacing required for big strokes. */
    y_spacing_scale: number;
    /** Font scaling for big strokes. */
    extra_stroke_scale: number;
    /**
     * @param num number of bars
     */
    constructor(num: number);
    /** Draw the tremolo on the rendering context. */
    draw(): void;
}
