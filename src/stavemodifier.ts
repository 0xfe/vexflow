// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A base class for stave modifiers (e.g. clefs, key signatures)

import { Element } from './element';
import { Glyph } from './glyph';
import { Stave } from './stave';

export interface LayoutMetrics {
  xMin: number;
  xMax: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface Metrics {
  totalLeftPx?: number;
  totalRightPx?: number;
  width: number;
  glyphWidth?: number;
  notePx?: number;
  modLeftPx?: number;
  modRightPx?: number;
  leftDisplacedHeadPx?: number;
  glyphPx?: number;
  rightDisplacedHeadPx?: number;
}
export interface StaveModifierSpacer {
  getContext(): boolean;
  setStave(): void;
  renderToStave(): void;
  getMetrics(): Metrics;
}

export enum Position {
  CENTER = 0,
  LEFT = 1,
  RIGHT = 2,
  ABOVE = 3,
  BELOW = 4,
  BEGIN = 5,
  END = 6,
}

export class StaveModifier extends Element {
  protected width: number = 0;
  protected x: number = 0;

  protected padding: number;
  protected position: Position;
  protected stave?: Stave;
  protected layoutMetrics?: LayoutMetrics;
  static get Position(): typeof Position {
    return Position;
  }

  constructor() {
    super();
    this.setAttribute('type', 'StaveModifier');

    this.padding = 10;
    this.position = StaveModifier.Position.ABOVE;
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

  getCategory(): string {
    return '';
  }

  makeSpacer(padding: number): StaveModifierSpacer {
    // TODO(0xfe): Return an instance of type `Spacer` based on `GhostNote`
    // instead of this hack.

    return {
      getContext() {
        return true;
      },
      setStave() {
        // do nothing
      },
      renderToStave() {
        // do nothing
      },
      getMetrics(): Metrics {
        return { width: padding };
      },
    };
  }

  placeGlyphOnLine(glyph: Glyph, stave: Stave, line: number, customShift = 0): void {
    glyph.setYShift(stave.getYForLine(line) - stave.getYForGlyphs() + customShift);
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

  draw(
    // eslint-disable-next-line
    element?: Element, x_shift?: number): void {
    // do nothing
  }
}
