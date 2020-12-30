// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements the `Stem` object. Generally this object is handled
// by its parent `StemmableNote`.
import {Element} from './element';
import {BoundingBox} from "./boundingbox";
import {IStemStruct} from "./types/stem";
import {RuntimeError} from "./runtimeerror";
import {LOG, STEM_HEIGHT, STEM_WIDTH} from "./flow";

// To enable logging for this class. Set `Vex.Flow.Stem.DEBUG` to `true`.
function L(...args: unknown[]) {
  if (Stem.DEBUG) LOG('Vex.Flow.Stem', args);
}

export class Stem extends Element {
  static DEBUG: boolean;

  renderHeightAdjustment: number;

  private hide: boolean;
  private isStemlet: boolean;
  private stemletHeight: number;
  private x_begin: number;
  private x_end: number;
  private y_top: number;
  private stem_up_y_offset: number;
  private y_bottom: number;
  private stem_down_y_offset: number;
  private stem_up_y_base_offset: number;
  private stem_down_y_base_offset: number;
  private stem_direction: number;
  private stem_extension: number;

  static get CATEGORY(): string {
    return 'stem';
  }

  // Stem directions
  static get UP(): number {
    return 1;
  }

  static get DOWN(): number {
    return -1;
  }

  // Theme
  static get WIDTH(): number {
    return STEM_WIDTH;
  }

  static get HEIGHT(): number {
    return STEM_HEIGHT;
  }

  constructor(options = {} as IStemStruct) {
    super();
    this.setAttribute('type', 'Stem');

    // Default notehead x bounds
    this.x_begin = options.x_begin || 0;
    this.x_end = options.x_end || 0;

    // Y bounds for top/bottom most notehead
    this.y_top = options.y_top || 0;
    this.y_bottom = options.y_bottom || 0;

    // Stem top extension
    this.stem_extension = options.stem_extension || 0;

    // Direction of the stem
    this.stem_direction = options.stem_direction || 0;

    // Flag to override all draw calls
    this.hide = options.hide || false;

    this.isStemlet = options.isStemlet || false;
    this.stemletHeight = options.stemletHeight || 0;

    // Use to adjust the rendered height without affecting
    // the results of `.getExtents()`
    this.renderHeightAdjustment = 0;
    this.setOptions(options);
  }

  setOptions(options: IStemStruct): void {
    // Changing where the stem meets the head
    this.stem_up_y_offset = options.stem_up_y_offset || 0;
    this.stem_down_y_offset = options.stem_down_y_offset || 0;
    this.stem_up_y_base_offset = options.stem_up_y_base_offset || 0;
    this.stem_down_y_base_offset = options.stem_down_y_base_offset || 0;
  }

  // Set the x bounds for the default notehead
  setNoteHeadXBounds(x_begin: number, x_end: number): this {
    this.x_begin = x_begin;
    this.x_end = x_end;
    return this;
  }

  // Set the direction of the stem in relation to the noteheads
  setDirection(direction: number): void {
    this.stem_direction = direction;
  }

  // Set the extension for the stem, generally for flags or beams
  setExtension(ext: number): void {
    this.stem_extension = ext;
  }

  getExtension(): number {
    return this.stem_extension;
  }

  // The the y bounds for the top and bottom noteheads
  setYBounds(y_top: number, y_bottom: number): void {
    this.y_top = y_top;
    this.y_bottom = y_bottom;
  }

  // The category of the object
  getCategory(): string {
    return Stem.CATEGORY;
  }

  // Gets the entire height for the stem
  getHeight(): number {
    const y_offset = (this.stem_direction === Stem.UP)
      ? this.stem_up_y_offset
      : this.stem_down_y_offset;
    const unsigned_height = (
      (this.y_bottom - this.y_top)
      + (Stem.HEIGHT - y_offset + this.stem_extension)
    );  // parentheses just for grouping.
    return unsigned_height * this.stem_direction;
  }

  getBoundingBox(): BoundingBox {
    throw new RuntimeError('NotImplemented', 'getBoundingBox() not implemented.');
  }

  // Get the y coordinates for the very base of the stem to the top of
  // the extension
  getExtents(): Record<string, number> {
    const isStemUp = this.stem_direction === Stem.UP;
    const ys = [this.y_top, this.y_bottom];
    const stemHeight = Stem.HEIGHT + this.stem_extension;

    const innerMostNoteheadY = (isStemUp ? Math.min : Math.max)(...ys);
    const outerMostNoteheadY = (isStemUp ? Math.max : Math.min)(...ys);
    const stemTipY = innerMostNoteheadY + (stemHeight * -this.stem_direction);

    return {topY: stemTipY, baseY: outerMostNoteheadY};
  }

  setVisibility(isVisible: boolean): this {
    this.hide = !isVisible;
    return this;
  }

  setStemlet(isStemlet: boolean, stemletHeight: number): this {
    this.isStemlet = isStemlet;
    this.stemletHeight = stemletHeight;
    return this;
  }

  // Render the stem onto the canvas
  draw(): void {
    this.setRendered();
    if (this.hide) return;
    const ctx = this.checkContext();

    let stem_x;
    let stem_y;
    const stem_direction = this.stem_direction;

    let y_base_offset: number;
    if (stem_direction === Stem.DOWN) {
      // Down stems are rendered to the left of the head.
      stem_x = this.x_begin;
      stem_y = this.y_top + this.stem_down_y_offset;
      y_base_offset = this.stem_down_y_base_offset;
    } else {
      // Up stems are rendered to the right of the head.
      stem_x = this.x_end;
      stem_y = this.y_bottom - this.stem_up_y_offset;
      y_base_offset = this.stem_up_y_base_offset;
    }

    const stemHeight = this.getHeight();

    L('Rendering stem - ', 'Top Y: ', this.y_top, 'Bottom Y: ', this.y_bottom);

    // The offset from the stem's base which is required fo satisfy the stemlet height
    const stemletYOffset = this.isStemlet
      ? stemHeight - this.stemletHeight * this.stem_direction
      : 0;

    // Draw the stem
    ctx.save();
    this.applyStyle(ctx);
    ctx.beginPath();
    ctx.setLineWidth(Stem.WIDTH);
    ctx.moveTo(stem_x, stem_y - stemletYOffset + y_base_offset);
    ctx.lineTo(stem_x, stem_y - stemHeight - (this.renderHeightAdjustment * stem_direction));
    ctx.stroke();
    this.restoreStyle(ctx);
    ctx.restore();
  }
}
