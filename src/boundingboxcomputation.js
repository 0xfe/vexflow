// ## Description
//
// Object which computes metrics for a bounding box by continuously
// taking canvas path commands

// Warning: This file is merely a crutch to get bounding box information without
// explicit metadata. This is likely to get deprecated following SMuFL support.
//
// taken from: https://github.com/gabelerner/canvg/blob/860e418aca67b9a41e858a223d74d375793ec364/ca
// nvg.js#L449

export class BoundingBoxComputation {
  constructor(x1, y1, x2, y2) { // pass in initial points if you want
    this.x1 = Number.NaN;
    this.y1 = Number.NaN;
    this.x2 = Number.NaN;
    this.y2 = Number.NaN;

    this.addPoint(x1, y1);
    this.addPoint(x2, y2);
  }

  width() {
    return this.x2 - this.x1;
  }

  height() {
    return this.y2 - this.y1;
  }

  noOp() {
    // do nothing
  }

  addPoint(x, y) {
    if (x != null) {
      if (isNaN(this.x1) || isNaN(this.x2)) {
        this.x1 = x;
        this.x2 = x;
      }
      if (x < this.x1) this.x1 = x;
      if (x > this.x2) this.x2 = x;
    }

    if (y != null) {
      if (isNaN(this.y1) || isNaN(this.y2)) {
        this.y1 = y;
        this.y2 = y;
      }
      if (y < this.y1) this.y1 = y;
      if (y > this.y2) this.y2 = y;
    }
  }

  addX(x) {
    this.addPoint(x, null);
  }

  addY(y) {
    this.addPoint(null, y);
  }

  addQuadraticCurve(p0x, p0y, p1x, p1y, p2x, p2y) {
    const cp1x = p0x + 2 / 3 * (p1x - p0x); // CP1 = QP0 + 2/3 *(QP1-QP0)
    const cp1y = p0y + 2 / 3 * (p1y - p0y); // CP1 = QP0 + 2/3 *(QP1-QP0)
    const cp2x = cp1x + 1 / 3 * (p2x - p0x); // CP2 = CP1 + 1/3 *(QP2-QP0)
    const cp2y = cp1y + 1 / 3 * (p2y - p0y); // CP2 = CP1 + 1/3 *(QP2-QP0)
    this.addBezierCurve(p0x, p0y, cp1x, cp1y, cp2x, cp2y, p2x, p2y);
  }

  addBezierCurve(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
    // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    const p0 = [p0x, p0y];
    const p1 = [p1x, p1y];
    const p2 = [p2x, p2y];
    const p3 = [p3x, p3y];
    let i;

    this.addPoint(p0[0], p0[1]);
    this.addPoint(p3[0], p3[1]);

    const f = (t, i) => Math.pow(1 - t, 3) * p0[i] +
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
