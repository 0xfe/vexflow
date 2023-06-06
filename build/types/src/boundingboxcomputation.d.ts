/**
 * BoundingBoxComputation computes metrics for a bounding box by continuously
 * taking canvas path commands.
 *
 * Warning: This class is merely a crutch to get bounding box information without
 * explicit metadata. This is likely to get deprecated following SMuFL support.
 *
 * based on: https://github.com/canvg/canvg/blob/master/src/BoundingBox.ts (MIT License)
 */
export declare class BoundingBoxComputation {
    protected x1: number;
    protected y1: number;
    protected x2: number;
    protected y2: number;
    /** Get calculated X1. */
    getX1(): number;
    /** Get calculated Y1. */
    getY1(): number;
    /** Get calculated width. */
    width(): number;
    /** Get calculated height. */
    height(): number;
    /** Add point to BoundingBox. */
    addPoint(x: number, y: number): void;
    /** Add X to BoundingBox. */
    addX(x: number): void;
    /** Add Y to BoundingBox. */
    addY(y: number): void;
    /** Add quadratic curve to BoundingBox. */
    addQuadraticCurve(p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number): void;
    /** Add bezier curve to BoundingBox. */
    addBezierCurve(p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number): void;
}
