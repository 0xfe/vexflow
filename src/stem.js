// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements the `Stem` object. Generally this object is handled
// by its parent `StemmableNote`.

import { Vex } from './vex';
import { Flow } from './tables';

// To enable logging for this class. Set `Vex.Flow.Stem.DEBUG` to `true`.
function L() { if (Stem.DEBUG) Vex.L('Vex.Flow.Stem', arguments); }

export class Stem {
  static get CATEGORY() { return 'stem'; }

  // Stem directions
  static get UP() {
    return 1;
  }
  static get DOWN() {
    return -1;
  }

  // Theme
  static get WIDTH() {
    return Flow.STEM_WIDTH;
  }
  static get HEIGHT() {
    return Flow.STEM_HEIGHT;
  }

  constructor(options = null) {
    if (options === null) {
      return;
    }
    // Default notehead x bounds
    this.x_begin = options.x_begin || 0;
    this.x_end = options.x_end || 0;

    // Y bounds for top/bottom most notehead
    this.y_top = options.y_top || 0;
    this.y_bottom = options.y_bottom || 0;

    // Stem base extension
    this.y_extend = options.y_extend || 0;
    // Stem top extension
    this.stem_extension = options.stem_extension || 0;

    // Direction of the stem
    this.stem_direction = options.stem_direction || 0;

    // Flag to override all draw calls
    this.hide = false;
  }

  // Set the x bounds for the default notehead
  setNoteHeadXBounds(x_begin, x_end) {
    this.x_begin = x_begin;
    this.x_end = x_end;
    return this;
  }

  // Set the direction of the stem in relation to the noteheads
  setDirection(direction) { this.stem_direction = direction; }

  // Set the extension for the stem, generally for flags or beams
  setExtension(ext) { this.stem_extension = ext; }

  // The the y bounds for the top and bottom noteheads
  setYBounds(y_top, y_bottom) {
    this.y_top = y_top;
    this.y_bottom = y_bottom;
  }

  // The category of the object
  getCategory() { return Stem.CATEGORY; }

  // Set the canvas context to render on
  setContext(context) { this.context = context; return this; }

  // Gets the entire height for the stem
  getHeight() {
    return ((this.y_bottom - this.y_top) * this.stem_direction) +
           ((Stem.HEIGHT + this.stem_extension) * this.stem_direction);
  }
  getBoundingBox() {
    throw new Vex.RERR('NotImplemented', 'getBoundingBox() not implemented.');
  }

  // Get the y coordinates for the very base of the stem to the top of
  // the extension
  getExtents() {
    const ys = [this.y_top, this.y_bottom];

    let top_pixel = this.y_top;
    let base_pixel = this.y_bottom;
    const stem_height = Stem.HEIGHT + this.stem_extension;

    for (let i = 0; i < ys.length; ++i) {
      const stem_top = ys[i] + (stem_height * -this.stem_direction);

      if (this.stem_direction == Stem.DOWN) {
        top_pixel = Math.max(top_pixel, stem_top);
        base_pixel = Math.min(base_pixel, ys[i]);
      } else {
        top_pixel = Math.min(top_pixel, stem_top);
        base_pixel = Math.max(base_pixel, ys[i]);
      }
    }

    return { topY: top_pixel, baseY: base_pixel };
  }

  // set the draw style of a stem:
  setStyle(style) { this.style = style; return this; }
  getStyle() { return this.style; }

  // Apply current style to Canvas `context`
  applyStyle(context) {
    const style = this.getStyle();
    if (style) {
      if (style.shadowColor) context.setShadowColor(style.shadowColor);
      if (style.shadowBlur) context.setShadowBlur(style.shadowBlur);
      if (style.strokeStyle) context.setStrokeStyle(style.strokeStyle);
    }
    return this;
  }

  // Render the stem onto the canvas
  draw() {
    if (!this.context) throw new Vex.RERR('NoCanvasContext',
        "Can't draw without a canvas context.");

    if (this.hide) return;

    const ctx = this.context;
    let stem_x, stem_y;
    const stem_direction = this.stem_direction;

    if (stem_direction == Stem.DOWN) {
      // Down stems are rendered to the left of the head.
      stem_x = this.x_begin + (Stem.WIDTH / 2);
      stem_y = this.y_top + 2;
    } else {
      // Up stems are rendered to the right of the head.
      stem_x = this.x_end + (Stem.WIDTH / 2);
      stem_y = this.y_bottom - 2;
    }

    stem_y += this.y_extend * stem_direction;

    L('Rendering stem - ', 'Top Y: ', this.y_top, 'Bottom Y: ', this.y_bottom);

    // Draw the stem
    ctx.save();
    this.applyStyle(ctx);
    ctx.beginPath();
    ctx.setLineWidth(Stem.WIDTH);
    ctx.moveTo(stem_x, stem_y);
    ctx.lineTo(stem_x, stem_y - this.getHeight());
    ctx.stroke();
    ctx.restore();
  }
}
