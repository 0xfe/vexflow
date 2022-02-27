import { BoundingBox } from './boundingbox';
import { Element } from './element';
export interface StemOptions {
    stem_down_y_base_offset?: number;
    stem_up_y_base_offset?: number;
    stem_down_y_offset?: number;
    stem_up_y_offset?: number;
    stemletHeight?: number;
    isStemlet?: boolean;
    hide?: boolean;
    stem_direction?: number;
    stem_extension?: number;
    y_bottom?: number;
    y_top?: number;
    x_end?: number;
    x_begin?: number;
}
export declare class Stem extends Element {
    /** To enable logging for this class. Set `Vex.Flow.Stem.DEBUG` to `true`. */
    static DEBUG: boolean;
    static get CATEGORY(): string;
    static get UP(): number;
    static get DOWN(): number;
    static get WIDTH(): number;
    static get HEIGHT(): number;
    protected hide: boolean;
    protected isStemlet: boolean;
    protected stemletHeight: number;
    protected x_begin: number;
    protected x_end: number;
    protected y_top: number;
    protected stem_up_y_offset: number;
    protected y_bottom: number;
    protected stem_down_y_offset: number;
    protected stem_up_y_base_offset: number;
    protected stem_down_y_base_offset: number;
    protected stem_direction: number;
    protected stem_extension: number;
    protected renderHeightAdjustment: number;
    constructor(options?: StemOptions);
    setOptions(options?: StemOptions): void;
    setNoteHeadXBounds(x_begin: number, x_end: number): this;
    setDirection(direction: number): void;
    setExtension(ext: number): void;
    getExtension(): number;
    setYBounds(y_top: number, y_bottom: number): void;
    getHeight(): number;
    getBoundingBox(): BoundingBox;
    getExtents(): {
        topY: number;
        baseY: number;
    };
    setVisibility(isVisible: boolean): this;
    setStemlet(isStemlet: boolean, stemletHeight: number): this;
    adjustHeightForFlag(): void;
    adjustHeightForBeam(): void;
    draw(): void;
}
