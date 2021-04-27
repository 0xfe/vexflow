// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

import { RenderContext } from './types/common';

// Bounding boxes for interactive notation

export class BoundingBox {
  protected x: number;
  protected y: number;
  protected w: number;
  protected h: number;

  static copy(that: BoundingBox): BoundingBox {
    return new BoundingBox(that.x, that.y, that.w, that.h);
  }

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getW(): number {
    return this.w;
  }

  getH(): number {
    return this.h;
  }

  setX(x: number): this {
    this.x = x;
    return this;
  }

  setY(y: number): this {
    this.y = y;
    return this;
  }

  setW(w: number): this {
    this.w = w;
    return this;
  }

  setH(h: number): this {
    this.h = h;
    return this;
  }

  move(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  clone(): BoundingBox {
    return BoundingBox.copy(this);
  }

  // Merge my box with given box. Creates a bigger bounding box unless
  // the given box is contained in this one.
  mergeWith(boundingBox: BoundingBox, ctx?: RenderContext): this {
    const that = boundingBox;

    const new_x = this.x < that.x ? this.x : that.x;
    const new_y = this.y < that.y ? this.y : that.y;
    const new_w = Math.max(this.x + this.w, that.x + that.w) - new_x;
    const new_h = Math.max(this.y + this.h, that.y + that.h) - new_y;

    this.x = new_x;
    this.y = new_y;
    this.w = new_w;
    this.h = new_h;

    if (ctx) this.draw(ctx);
    return this;
  }

  draw(ctx: RenderContext, x?: number, y?: number): void {
    if (!x) x = 0;
    if (!y) y = 0;
    ctx.rect(this.x + x, this.y + y, this.w, this.h);
    ctx.stroke();
  }
}
