// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A base class for stave modifiers (e.g. clefs, key signatures)

import { Element } from './element';
import { Glyph } from './glyph';
import { Stave } from './stave';
import { Category } from './typeguard';
import { defined } from './util';

export interface LayoutMetrics {
  xMin: number;
  xMax: number;
  paddingLeft: number;
  paddingRight: number;
}

export enum StaveModifierPosition {
  CENTER = 0,
  LEFT = 1,
  RIGHT = 2,
  ABOVE = 3,
  BELOW = 4,
  BEGIN = 5,
  END = 6,
}

export class StaveModifier extends Element {
  static get CATEGORY(): string {
    return Category.StaveModifier;
  }

  static get Position(): typeof StaveModifierPosition {
    return StaveModifierPosition;
  }

  protected width: number = 0;
  protected x: number = 0;

  protected padding: number;
  protected position: StaveModifierPosition;
  protected stave?: Stave;
  protected layoutMetrics?: LayoutMetrics;

  constructor() {
    super();

    this.padding = 10;
    this.position = StaveModifierPosition.ABOVE;
  }

  getPosition(): number {
    return this.position;
  }

  setPosition(position: number): this {
    this.position = position;
    return this;
  }

  getStave(): Stave | undefined {
    return this.stave;
  }

  checkStave(): Stave {
    return defined(this.stave, 'NoStave', 'No stave attached to instance.');
  }

  setStave(stave: Stave): this {
    this.stave = stave;
    return this;
  }

  getWidth(): number {
    return this.width;
  }

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  getX(): number {
    return this.x;
  }

  setX(x: number): this {
    this.x = x;
    return this;
  }

  /**
   * Runs setYShift() for the Glyph object so that it matches the position of line for
   * the Stave provided.  A `customShift` can also be given (measured in the same units
   * as `setYShift` not in lines) and this will be added after all other positions are
   * calculated from the Stave.
   *
   * Note that this routine only sets the yShift; it does not actually "place" (meaning
   * draw) the Glyph on the Stave.  Call .draw() afterwards to do that.
   */
  placeGlyphOnLine(glyph: Glyph, stave: Stave, line?: number, customShift = 0): void {
    glyph.setYShift(stave.getYForLine(line ?? 0) - stave.getYForGlyphs() + customShift);
  }

  getPadding(index: number): number {
    return index !== undefined && index < 2 ? 0 : this.padding;
  }

  setPadding(padding: number): this {
    this.padding = padding;
    return this;
  }

  setLayoutMetrics(layoutMetrics: LayoutMetrics): this {
    this.layoutMetrics = layoutMetrics;
    return this;
  }

  getLayoutMetrics(): LayoutMetrics | undefined {
    return this.layoutMetrics;
  }

  // eslint-disable-next-line
  draw(...args: any[]): void {
    // DO NOTHING.
  }
}
