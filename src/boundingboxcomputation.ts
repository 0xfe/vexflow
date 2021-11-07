// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/**
 * BoundingBoxComputation computes metrics for a bounding box by continuously
 * taking canvas path commands.
 *
 * Warning: This class is merely a crutch to get bounding box information without
 * explicit metadata. This is likely to get deprecated following SMuFL support.
 *
 * based on: https://github.com/canvg/canvg/blob/master/src/BoundingBox.ts (MIT License)
 */
export class BoundingBoxComputation {
  protected x1: number = Number.NaN;
  protected y1: number = Number.NaN;
  protected x2: number = Number.NaN;
  protected y2: number = Number.NaN;

  /** Get calculated X1. */
  getX1(): number {
    return this.x1;
  }

  /** Get calculated Y1. */
  getY1(): number {
    return this.y1;
  }

  /** Get calculated width. */
  width(): number {
    return this.x2 - this.x1;
  }

  /** Get calculated height. */
  height(): number {
    return this.y2 - this.y1;
  }

  /** Add point to BoundingBox. */
  addPoint(x: number, y: number): void {
    if (isNaN(this.x1) || x < this.x1) this.x1 = x;
    if (isNaN(this.x2) || x > this.x2) this.x2 = x;
    if (isNaN(this.y1) || y < this.y1) this.y1 = y;
    if (isNaN(this.y2) || y > this.y2) this.y2 = y;
  }

  /** Add X to BoundingBox. */
  addX(x: number): void {
    this.addPoint(x, this.y1);
  }

  /** Add Y to BoundingBox. */
  addY(y: number): void {
    this.addPoint(this.x1, y);
  }

  /** Add quadratic curve to BoundingBox. */
  addQuadraticCurve(p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number): void {
    this.addPoint(p0x, p0y);
    this.addPoint(p2x, p2y);

    const p01x = p1x - p0x;
    const p12x = p2x - p1x;
    let denom = p01x - p12x;
    if (denom != 0) {
      const t = p01x / denom;
      if (t > 0 && t < 1) {
        const it = 1 - t;
        this.addX(it * it * p0x + 2 * it * t * p1x + t * t * p2x);
      }
    }

    const p01y = p1y - p0y;
    const p12y = p2y - p1y;
    denom = p01y - p12y;
    if (denom != 0) {
      const t = p01y / denom;
      if (t > 0 && t < 1) {
        const it = 1 - t;
        this.addY(it * it * p0y + 2 * it * t * p1y + t * t * p2y);
      }
    }
  }

  /** Add bezier curve to BoundingBox. */
  addBezierCurve(
    p0x: number,
    p0y: number,
    p1x: number,
    p1y: number,
    p2x: number,
    p2y: number,
    p3x: number,
    p3y: number
  ): void {
    // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    const p0 = [p0x, p0y];
    const p1 = [p1x, p1y];
    const p2 = [p2x, p2y];
    const p3 = [p3x, p3y];
    let i;

    this.addPoint(p0[0], p0[1]);
    this.addPoint(p3[0], p3[1]);

    const f = (t: number, i: number) =>
      Math.pow(1 - t, 3) * p0[i] +
      3 * Math.pow(1 - t, 2) * t * p1[i] +
      3 * (1 - t) * Math.pow(t, 2) * p2[i] +
      Math.pow(t, 3) * p3[i];

    for (i = 0; i <= 1; i++) {
      const b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
      const a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
      const c = 3 * p1[i] - 3 * p0[i];

      if (a === 0) {
        if (b === 0) continue;
        const t = -c / b;
        if (0 < t && t < 1) {
          if (i === 0) this.addX(f(t, i));
          if (i === 1) this.addY(f(t, i));
        }
        continue;
      }

      const b2ac = Math.pow(b, 2) - 4 * c * a;
      if (b2ac < 0) continue;
      const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
      if (0 < t1 && t1 < 1) {
        if (i === 0) this.addX(f(t1, i));
        if (i === 1) this.addY(f(t1, i));
      }
      const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
      if (0 < t2 && t2 < 1) {
        if (i === 0) this.addX(f(t2, i));
        if (i === 1) this.addY(f(t2, i));
      }
    }
  }
}
