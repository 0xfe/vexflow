// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// This file implements the `Stem` object. Generally this object is handled
// by its parent `StemmableNote`.

import { BoundingBox } from './boundingbox';
import { Element } from './element';
import { Tables } from './tables';
import { Category } from './typeguard';
import { log, RuntimeError } from './util';

// eslint-disable-next-line
function L(...args: any[]) {
  if (Stem.DEBUG) log('Vex.Flow.Stem', args);
}

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

export class Stem extends Element {
  /** To enable logging for this class. Set `Vex.Flow.Stem.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.Stem;
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
    return Tables.STEM_WIDTH;
  }
  static get HEIGHT(): number {
    return Tables.STEM_HEIGHT;
  }

  protected hide: boolean;
  protected isStemlet: boolean;
  protected stemletHeight: number;
  protected x_begin: number;
  protected x_end: number;
  protected y_top: number;
  protected stem_up_y_offset: number = 0;
  protected y_bottom: number;
  protected stem_down_y_offset: number = 0;
  protected stem_up_y_base_offset: number = 0;
  protected stem_down_y_base_offset: number = 0;
  protected stem_direction: number;
  protected stem_extension: number;
  protected renderHeightAdjustment: number;

  constructor(options?: StemOptions) {
    super();

    // Default notehead x bounds
    this.x_begin = options?.x_begin || 0;
    this.x_end = options?.x_end || 0;

    // Y bounds for top/bottom most notehead
    this.y_top = options?.y_top || 0;
    this.y_bottom = options?.y_bottom || 0;

    // Stem top extension
    this.stem_extension = options?.stem_extension || 0;

    // Direction of the stem
    this.stem_direction = options?.stem_direction || 0;

    // Flag to override all draw calls
    this.hide = options?.hide || false;

    this.isStemlet = options?.isStemlet || false;
    this.stemletHeight = options?.stemletHeight || 0;

    // Use to adjust the rendered height without affecting
    // the results of `.getExtents()`
    this.renderHeightAdjustment = 0;
    this.setOptions(options);
  }

  setOptions(options?: StemOptions): void {
    // Changing where the stem meets the head
    this.stem_up_y_offset = options?.stem_up_y_offset || 0;
    this.stem_down_y_offset = options?.stem_down_y_offset || 0;
    this.stem_up_y_base_offset = options?.stem_up_y_base_offset || 0;
    this.stem_down_y_base_offset = options?.stem_down_y_base_offset || 0;
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

  // Gets the entire height for the stem
  getHeight(): number {
    const y_offset = this.stem_direction === Stem.UP ? this.stem_up_y_offset : this.stem_down_y_offset;
    const unsigned_height = this.y_bottom - this.y_top + (Stem.HEIGHT - y_offset + this.stem_extension); // parentheses just for grouping.
    return unsigned_height * this.stem_direction;
  }

  getBoundingBox(): BoundingBox {
    throw new RuntimeError('NotImplemented', 'getBoundingBox() not implemented.');
  }

  // Get the y coordinates for the very base of the stem to the top of
  // the extension
  getExtents(): { topY: number; baseY: number } {
    const isStemUp = this.stem_direction === Stem.UP;
    const ys = [this.y_top, this.y_bottom];
    const stemHeight = Stem.HEIGHT + this.stem_extension;

    const innerMostNoteheadY = (isStemUp ? Math.min : Math.max)(...ys);
    const outerMostNoteheadY = (isStemUp ? Math.max : Math.min)(...ys);
    const stemTipY = innerMostNoteheadY + stemHeight * -this.stem_direction;

    return { topY: stemTipY, baseY: outerMostNoteheadY };
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

  adjustHeightForFlag(): void {
    this.renderHeightAdjustment = Tables.currentMusicFont().lookupMetric('stem.heightAdjustmentForFlag', -3);
  }

  adjustHeightForBeam(): void {
    this.renderHeightAdjustment = -Stem.WIDTH / 2;
  }

  // Render the stem onto the canvas
  draw(): void {
    this.setRendered();
    if (this.hide) return;
    const ctx = this.checkContext();

    let stem_x;
    let stem_y;
    const stem_direction = this.stem_direction;

    let y_base_offset: number = 0;
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
    const stemletYOffset = this.isStemlet ? stemHeight - this.stemletHeight * this.stem_direction : 0;

    // Draw the stem
    ctx.save();
    this.applyStyle();
    ctx.openGroup('stem', this.getAttribute('id'), { pointerBBox: true });
    ctx.beginPath();
    ctx.setLineWidth(Stem.WIDTH);
    ctx.moveTo(stem_x, stem_y - stemletYOffset + y_base_offset);
    ctx.lineTo(stem_x, stem_y - stemHeight - this.renderHeightAdjustment * stem_direction);
    ctx.stroke();
    ctx.closeGroup();
    this.restoreStyle();
    ctx.restore();
  }
}
