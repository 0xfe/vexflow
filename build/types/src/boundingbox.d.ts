export interface Bounds {
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare class BoundingBox implements Bounds {
    x: number;
    y: number;
    w: number;
    h: number;
    /**
     * Create a new copy.
     */
    static copy(that: BoundingBox): BoundingBox;
    constructor(x: number, y: number, w: number, h: number);
    /** Get x position. */
    getX(): number;
    /** Get y position. */
    getY(): number;
    /** Get width. */
    getW(): number;
    /** Get height. */
    getH(): number;
    /** Set x position. */
    setX(x: number): this;
    /** Set y position. */
    setY(y: number): this;
    /** Set width. */
    setW(w: number): this;
    /** Set height. */
    setH(h: number): this;
    /** Move to position. */
    move(x: number, y: number): this;
    /** Clone. */
    clone(): BoundingBox;
    /**
     * Merge my box with given box. Creates a bigger bounding box unless
     * the given box is contained in this one.
     */
    mergeWith(boundingBox: BoundingBox): this;
}
