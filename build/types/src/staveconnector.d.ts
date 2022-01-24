import { Element } from './element';
import { FontInfo } from './font';
import { Stave } from './stave';
/** StaveConnector implements the connector lines between staves of a system. */
export declare class StaveConnector extends Element {
    static get CATEGORY(): string;
    static TEXT_FONT: Required<FontInfo>;
    /**
     * SINGLE_LEFT and SINGLE are the same value for compatibility
     * with older versions of vexflow which didn't have right sided
     * stave connectors.
     */
    static readonly type: {
        SINGLE_RIGHT: number;
        SINGLE_LEFT: number;
        SINGLE: number;
        DOUBLE: number;
        BRACE: number;
        BRACKET: number;
        BOLD_DOUBLE_LEFT: number;
        BOLD_DOUBLE_RIGHT: number;
        THIN_DOUBLE: number;
        NONE: number;
    };
    /**
     * Connector type:
     * * "singleRight"
     * * "singleLeft"
     * * "single"
     * * "double"
     * * "brace"
     * * "bracket"
     * * "boldDoubleLeft"
     * * "boldDoubleRight"
     * * "thinDouble"
     * * "none"
     */
    static readonly typeString: Record<string, number>;
    protected width: number;
    protected texts: {
        content: string;
        options: {
            shift_x: number;
            shift_y: number;
        };
    }[];
    protected type: number;
    readonly top_stave: Stave;
    readonly bottom_stave: Stave;
    readonly thickness: number;
    protected x_shift: number;
    constructor(top_stave: Stave, bottom_stave: Stave);
    /**
     * Set type.
     * @param type see {@link StaveConnector.type} & {@link StaveConnector.typeString}
     */
    setType(type: number | string): this;
    /** Set optional associated Text. */
    setText(text: string, options?: {
        shift_x?: number;
        shift_y?: number;
    }): this;
    setXShift(x_shift: number): this;
    getXShift(): number;
    /** Render connector and associated text. */
    draw(): void;
}
