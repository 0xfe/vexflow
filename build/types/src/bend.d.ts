import { FontInfo } from './font';
import { Modifier } from './modifier';
import { ModifierContextState } from './modifiercontext';
export interface BendPhrase {
    x?: number;
    type: number;
    text: string;
    width?: number;
    draw_width?: number;
}
/** Bend implements tablature bends. */
export declare class Bend extends Modifier {
    static get CATEGORY(): string;
    static get UP(): number;
    static get DOWN(): number;
    /** Default text font. */
    static TEXT_FONT: Required<FontInfo>;
    static format(bends: Bend[], state: ModifierContextState): boolean;
    protected text: string;
    protected tap: string;
    protected release: boolean;
    protected phrase: BendPhrase[];
    render_options: {
        line_width: number;
        release_width: number;
        bend_width: number;
        line_style: string;
    };
    /**
     * Example of a phrase:
     * ```
     *    [{
     *     type: UP,
     *     text: "whole"
     *     width: 8;
     *   },
     *   {
     *     type: DOWN,
     *     text: "whole"
     *     width: 8;
     *   },
     *   {
     *     type: UP,
     *     text: "half"
     *     width: 8;
     *   },
     *   {
     *     type: UP,
     *     text: "whole"
     *     width: 8;
     *   },
     *   {
     *     type: DOWN,
     *     text: "1 1/2"
     *     width: 8;
     *   }]
     * ```
     * @param text text for bend ("Full", "Half", etc.) (DEPRECATED)
     * @param release if true, render a release. (DEPRECATED)
     * @param phrase if set, ignore "text" and "release", and use the more sophisticated phrase specified
     */
    constructor(text: string, release?: boolean, phrase?: BendPhrase[]);
    /** Set horizontal shift in pixels. */
    setXShift(value: number): this;
    setTap(value: string): this;
    /** Get text provided in the constructor. */
    getText(): string;
    getTextHeight(): number;
    /** Recalculate width. */
    protected updateWidth(): this;
    /** Draw the bend on the rendering context. */
    draw(): void;
}
