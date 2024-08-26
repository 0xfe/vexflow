export class BoundingBoxComputation {
    constructor() {
        this.x1 = Number.NaN;
        this.y1 = Number.NaN;
        this.x2 = Number.NaN;
        this.y2 = Number.NaN;
    }
    getX1() {
        return this.x1;
    }
    getY1() {
        return this.y1;
    }
    width() {
        return this.x2 - this.x1;
    }
    height() {
        return this.y2 - this.y1;
    }
    addPoint(x, y) {
        if (isNaN(this.x1) || x < this.x1)
            this.x1 = x;
        if (isNaN(this.x2) || x > this.x2)
            this.x2 = x;
        if (isNaN(this.y1) || y < this.y1)
            this.y1 = y;
        if (isNaN(this.y2) || y > this.y2)
            this.y2 = y;
    }
    addX(x) {
        this.addPoint(x, this.y1);
    }
    addY(y) {
        this.addPoint(this.x1, y);
    }
    addQuadraticCurve(p0x, p0y, p1x, p1y, p2x, p2y) {
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
    addBezierCurve(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
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
                if (b === 0)
                    continue;
                const t = -c / b;
                if (0 < t && t < 1) {
                    if (i === 0)
                        this.addX(f(t, i));
                    if (i === 1)
                        this.addY(f(t, i));
                }
                continue;
            }
            const b2ac = Math.pow(b, 2) - 4 * c * a;
            if (b2ac < 0)
                continue;
            const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
            if (0 < t1 && t1 < 1) {
                if (i === 0)
                    this.addX(f(t1, i));
                if (i === 1)
                    this.addY(f(t1, i));
            }
            const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
            if (0 < t2 && t2 < 1) {
                if (i === 0)
                    this.addX(f(t2, i));
                if (i === 1)
                    this.addY(f(t2, i));
            }
        }
    }
}
