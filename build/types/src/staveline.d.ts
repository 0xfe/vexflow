import { Element } from './element';
import { FontInfo } from './font';
import { RenderContext } from './rendercontext';
import { StaveNote } from './stavenote';
import { TextJustification } from './textnote';
export interface StaveLineNotes {
    first_note: StaveNote;
    first_indices: number[];
    last_note: StaveNote;
    last_indices: number[];
}
export declare class StaveLine extends Element {
    static get CATEGORY(): string;
    /** Default text font. */
    static TEXT_FONT: Required<FontInfo>;
    static readonly TextVerticalPosition: {
        TOP: number;
        BOTTOM: number;
    };
    static readonly TextJustification: typeof TextJustification;
    render_options: {
        padding_left: number;
        padding_right: number;
        line_width: number;
        line_dash?: number[];
        rounded_end: boolean;
        color?: string;
        draw_start_arrow: boolean;
        draw_end_arrow: boolean;
        arrowhead_length: number;
        arrowhead_angle: number;
        text_position_vertical: number;
        text_justification: number;
    };
    protected text: string;
    protected notes: StaveLineNotes;
    protected first_note: StaveNote;
    protected first_indices: number[];
    protected last_note: StaveNote;
    protected last_indices: number[];
    constructor(notes: StaveLineNotes);
    setText(text: string): this;
    setNotes(notes: StaveLineNotes): this;
    applyLineStyle(): void;
    applyFontStyle(): void;
    protected drawArrowLine(ctx: RenderContext, pt1: {
        x: number;
        y: number;
    }, pt2: {
        x: number;
        y: number;
    }): void;
    draw(): this;
}
