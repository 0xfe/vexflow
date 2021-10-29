// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A base class for stave modifiers (e.g. clefs, key signatures)

import { Element } from './element';
import { Glyph } from './glyph';
import { Stave } from './stave';
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
    return 'StaveModifier';
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
  draw(element?: Element, x_shift?: number): void {
    // DO NOTHING.
  }
}
