// Vex Music Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2010

// Bounding boxes for interactive notation

import {DrawContext} from "./types/common";

export class BoundingBox {
  y: number;
  private x: number;
  private w: number;
  h: number;

  static copy(that: BoundingBox) {
    return new BoundingBox(that.x, that.y, that.w, that.h);
  }

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getW() {
    return this.w;
  }

  getH() {
    return this.h;
  }

  setX(x: number) {
    this.x = x;
    return this;
  }

  setY(y: number) {
    this.y = y;
    return this;
  }

  setW(w: number) {
    this.w = w;
    return this;
  }

  setH(h: number) {
    this.h = h;
    return this;
  }

  move(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

  clone() {
    return BoundingBox.copy(this);
  }

  // Merge my box with given box. Creates a bigger bounding box unless
  // the given box is contained in this one.
  mergeWith(boundingBox: BoundingBox, ctx?: DrawContext) {
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

  draw(ctx: DrawContext, x?: number, y?: number) {
    if (!x) x = 0;
    if (!y) y = 0;
    ctx.rect(this.x + x, this.y + y, this.w, this.h);
    ctx.stroke();
  }
}
