// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
//
// ## Description
// A base class for stave modifiers (e.g. clefs, key signatures)

import {Element} from './element';
import {Stave} from "./stave";
import {Glyph} from "./glyph";
import {ILayoutMetrics, IMetrics} from "./types/common";
import {IStaveModifierSpacer} from "./types/stavemodifier";

export enum Position {
  CENTER = 0,
  LEFT = 1,
  RIGHT = 2,
  ABOVE = 3,
  BELOW = 4,
  BEGIN = 5,
  END = 6
}

export class StaveModifier extends Element {
  width: number;
  x: number;

  protected padding: number;
  protected position: Position;
  protected stave: Stave;
  private layoutMetrics: ILayoutMetrics;

  static get Position(): typeof Position {
    return Position;
  }

  constructor() {
    super();
    this.setAttribute('type', 'StaveModifier');

    this.padding = 10;
    this.position = StaveModifier.Position.ABOVE;
    this.layoutMetrics = null;
  }

  getPosition(): number {
    return this.position;
  }

  setPosition(position: number): this {
    this.position = position;
    return this;
  }

  getStave(): Stave {
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

  makeSpacer(padding: number): IStaveModifierSpacer {
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
      getMetrics(): IMetrics {
        return {width: padding} as IMetrics;
      }
    };
  }

  placeGlyphOnLine(glyph: Glyph, stave: Stave, line: number, customShift = 0): void {
    glyph.setYShift(stave.getYForLine(line) - stave.getYForGlyphs() + customShift);
  }

  getPadding(index: number): number {
    return (index !== undefined && index < 2 ? 0 : this.padding);
  }

  setPadding(padding: number): this {
    this.padding = padding;
    return this;
  }

  setLayoutMetrics(layoutMetrics: ILayoutMetrics): this {
    this.layoutMetrics = layoutMetrics;
    return this;
  }

  getLayoutMetrics(): ILayoutMetrics {
    return this.layoutMetrics;
  }
}
